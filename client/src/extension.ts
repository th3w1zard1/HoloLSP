import * as path from "path";
import * as vscode from "vscode";
import { commands, debug, DebugConfiguration, ExtensionContext, window, workspace } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { NWScriptConfigurationProvider, NWScriptDebugAdapterDescriptorFactory, NWScriptDebugAdapterTrackerFactory } from "./debugAdapter";

let client: LanguageClient;
let debugDisposables: ExtensionContext['subscriptions'] = [];
let outputChannel: vscode.LogOutputChannel;

export function activate(context: ExtensionContext) {
  // Create dedicated log output channel for HoloLSP that integrates with VS Code's log level system
  outputChannel = vscode.window.createOutputChannel("HoloLSP", { log: true });
  context.subscriptions.push(outputChannel);

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for NWScript files
    documentSelector: [
      { scheme: "file", language: "nwscript" },
      { scheme: "file", pattern: "**/*.nss" },
      { scheme: "file", pattern: "**/*.ncs" }
    ],
    synchronize: {
      // Notify the server about file changes to NWScript files and includes
      fileEvents: workspace.createFileSystemWatcher("**/*.{nss,ncs}"),
    },
    // Route server console output to our dedicated channel
    outputChannel: outputChannel,
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "holo-lsp",
    "HoloLSP - KOTOR NWScript Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start().then(() => {
    outputChannel.info('HoloLSP client started successfully');
    outputChannel.info('Language server connection established');
    
    // Register the debug adapter provider after the client is ready
    setupDebugger(context);

    // Register virtual include document provider for go-to-definition
    const provider: vscode.TextDocumentContentProvider = {
      provideTextDocumentContent: async (uri: vscode.Uri): Promise<string> => {
        try {
          // Expecting URIs like: hololsp:/kotor/<include>.nss
          const file = uri.path.split('/').pop() || '';
          const include = file.replace(/\.nss$/i, '');
          outputChannel.debug(`Requesting include content: ${include}`);
          const result = await client.sendRequest<{ text: string } | null>('hololsp/includeText', { include });
          return result?.text ?? `// Unable to load include: ${include}`;
        } catch (err: any) {
          const errorMsg = String(err);
          // 'include' may not be defined in this scope if error occurs before its declaration
          // So, try to extract it from the URI as a fallback
          let includeName = '';
          try {
            const file = uri.path.split('/').pop() || '';
            includeName = file.replace(/\.nss$/i, '');
          } catch {
            includeName = '<unknown>';
          }
          outputChannel.error(`Error loading include ${includeName}: ${errorMsg}`);
          return `// Error loading content: ${errorMsg}`;
        }
      }
    };
    debugDisposables.push(vscode.workspace.registerTextDocumentContentProvider('hololsp', provider));
  }).catch((error) => {
    outputChannel.error(`Failed to start HoloLSP: ${error}`);
    vscode.window.showErrorMessage(`Failed to start HoloLSP: ${error}`);
  });
}

/**
 * Set up the NWScript debugger
 */
function setupDebugger(context: ExtensionContext): void {
  outputChannel.debug('Setting up NWScript debugger');
  
  // Register a debug configuration provider for 'nwscript' debug type
  const provider = new NWScriptConfigurationProvider();
  debugDisposables.push(debug.registerDebugConfigurationProvider('nwscript', provider));
  outputChannel.debug('Debug configuration provider registered');

  // Register a debug adapter descriptor factory for 'nwscript' debug type
  const factory = new NWScriptDebugAdapterDescriptorFactory(client);
  debugDisposables.push(debug.registerDebugAdapterDescriptorFactory('nwscript', factory));
  debugDisposables.push(factory); // Also dispose the factory
  outputChannel.debug('Debug adapter descriptor factory registered');

  // Register a debug adapter tracker factory for 'nwscript' debug type
  const trackerFactory = new NWScriptDebugAdapterTrackerFactory();
  debugDisposables.push(debug.registerDebugAdapterTrackerFactory('nwscript', trackerFactory));
  outputChannel.debug('Debug adapter tracker factory registered');

  // Register commands for debugging (guard duplicates)
  commands.getCommands(true).then(all => {
    if (all.includes('nwscript.startDebugging')) {
      outputChannel.debug('Debug command already exists, skipping registration');
      return; // already exists
    }
    debugDisposables.push(
      commands.registerCommand('nwscript.startDebugging', async () => {
        outputChannel.info('Starting NWScript debugging session');
        const editor = window.activeTextEditor;
        if (!editor) {
          const error = 'No active editor found';
          outputChannel.error(`Debug error: ${error}`);
          window.showErrorMessage(error);
          return;
        }

        const document = editor.document;
        if (document.languageId !== 'nwscript' && !document.fileName.toLowerCase().endsWith('.nss')) {
          const error = 'Not a NWScript file';
          outputChannel.error(`Debug error: ${error}`);
          window.showErrorMessage(error);
          return;
        }

        // Start debugging the current file
        const config: DebugConfiguration = {
          type: 'nwscript',
          name: 'Debug NWScript',
          request: 'launch',
          script: document.fileName,
          stopOnEntry: true
        };

        outputChannel.info(`Starting debug session for: ${document.fileName}`);
        await debug.startDebugging(undefined, config);
      })
    );
    outputChannel.debug('Debug command registered');
  });
}

export function deactivate(): Thenable<void> | undefined {
  outputChannel.info('Deactivating HoloLSP extension');
  
  // Clean up debug disposables
  debugDisposables.forEach(d => d.dispose());
  debugDisposables = [];
  outputChannel.debug('Debug disposables cleaned up');

  if (!client) {
    outputChannel.debug('No client to stop');
    return undefined;
  }
  
  outputChannel.info('Stopping language server');
  return client.stop().then(() => {
    outputChannel.info('Language server stopped successfully');
  }).catch((error) => {
    outputChannel.error(`Error stopping language server: ${error}`);
  });
}
