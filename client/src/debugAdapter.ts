import {
  DebugSession,
  InitializedEvent,
  Scope,
  Source,
  StackFrame,
  StoppedEvent,
  TerminatedEvent,
  Thread,
  ThreadEvent,
  Variable
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

/**
 * Debug adapter for NWScript debugging
 * Translates between the Debug Adapter Protocol (DAP) and our custom LSP debug protocol
 */
export class NWScriptDebugAdapter extends DebugSession {
  private static threadID = 1;
  private client: LanguageClient;
  private variableHandles = new Map<number, string>();
  private nextVariableHandle = 1;

  constructor(client: LanguageClient) {
    super();
    this.client = client;

    // Debug adapter settings
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);
  }

  /**
   * Initialize debug session
   */
  override initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsEvaluateForHovers = true;
    response.body.supportsStepBack = false;
    response.body.supportsSetVariable = false;
    response.body.supportsFunctionBreakpoints = false;
    response.body.supportsConditionalBreakpoints = false;
    response.body.supportsHitConditionalBreakpoints = false;
    response.body.supportsLogPoints = false;
    response.body.supportsRestartFrame = false;
    response.body.supportsStepInTargetsRequest = false;
    response.body.supportsGotoTargetsRequest = false;
    response.body.supportsCompletionsRequest = false;
    response.body.supportsRestartRequest = false;
    response.body.supportsExceptionOptions = false;
    response.body.supportsValueFormattingOptions = false;
    response.body.supportsExceptionInfoRequest = false;
    response.body.supportsSingleThreadExecutionRequests = true;

    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  /**
   * Launch the debugger
   */
  override async launchRequest(response: DebugProtocol.LaunchResponse, args: any): Promise<void> {
    try {
      const scriptPath = args.script;
      if (!scriptPath) {
        this.sendErrorResponse(response, {
          id: 1,
          format: 'Script path not specified',
          showUser: true
        });
        return;
      }

      // Start the debugging session on the server
      const result = await this.client.sendRequest('nwscript/debug/start', {
        scriptPath
      }) as { success: boolean; message?: string };

      if (result.success) {
        // Create and start a thread
        this.sendEvent(new ThreadEvent('started', NWScriptDebugAdapter.threadID));
        this.sendResponse(response);

        // Send stopped event to show initial state
        this.sendEvent(new StoppedEvent('entry', NWScriptDebugAdapter.threadID));
      } else {
        this.sendErrorResponse(response, {
          id: 2,
          format: `Failed to start debugging: ${result.message}`,
          showUser: true
        });
      }
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 3,
        format: `Error launching debug session: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Set breakpoints
   */
  override async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): Promise<void> {
    const source = args.source;
    const breakpoints = args.breakpoints || [];

    try {
      // Forward breakpoints to the server
      const result = await this.client.sendRequest('nwscript/debug/setBreakpoints', {
        source: {
          path: source.path
        },
        breakpoints: breakpoints.map(bp => ({
          line: bp.line
        }))
      }) as { breakpoints: any[] };

      response.body = {
        breakpoints: result.breakpoints.map((bp: any) => ({
          id: bp.id,
          verified: bp.verified,
          source: source,
          line: bp.line
        }))
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 4,
        format: `Error setting breakpoints: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Continue execution after a breakpoint or step
   */
  override async continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/continue', {}) as { success: boolean; message?: string };

      if (result.success) {
        response.body = {
          allThreadsContinued: true
        };
        this.sendResponse(response);
      } else {
        this.sendErrorResponse(response, {
          id: 5,
          format: `Failed to continue: ${result.message}`,
          showUser: true
        });
      }
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 6,
        format: `Error continuing execution: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Step over the current line
   */
  override async nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/next', {}) as { success: boolean; message?: string };

      if (result.success) {
        this.sendResponse(response);
      } else {
        this.sendErrorResponse(response, {
          id: 7,
          format: `Failed to step over: ${result.message}`,
          showUser: true
        });
      }
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 8,
        format: `Error stepping over: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Step into a function
   */
  override async stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/stepIn', {}) as { success: boolean; message?: string };

      if (result.success) {
        this.sendResponse(response);
      } else {
        this.sendErrorResponse(response, {
          id: 9,
          format: `Failed to step in: ${result.message}`,
          showUser: true
        });
      }
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 10,
        format: `Error stepping in: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Step out of current function
   */
  override async stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/stepOut', {}) as { success: boolean; message?: string };

      if (result.success) {
        this.sendResponse(response);
      } else {
        this.sendErrorResponse(response, {
          id: 11,
          format: `Failed to step out: ${result.message}`,
          showUser: true
        });
      }
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 12,
        format: `Error stepping out: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Pause execution
   */
  override async pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/pause', {}) as { success: boolean; message?: string };

      if (result.success) {
        this.sendResponse(response);
      } else {
        this.sendErrorResponse(response, {
          id: 13,
          format: `Failed to pause: ${result.message}`,
          showUser: true
        });
      }
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 14,
        format: `Error pausing: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Get stack trace
   */
  override async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/stackTrace', {}) as { stackFrames: any[]; totalFrames: number };

      const stackFrames = result.stackFrames.map((frame: any) => {
        return new StackFrame(
          frame.id,
          frame.name,
          new Source(
            frame.source.name,
            frame.source.path
          ),
          frame.line,
          frame.column
        );
      });

      response.body = {
        stackFrames,
        totalFrames: result.totalFrames
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 15,
        format: `Error getting stack trace: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Get available scopes
   */
  override async scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): Promise<void> {
    try {
      const frameId = args.frameId;
      const result = await this.client.sendRequest('nwscript/debug/scopes', { frameId }) as { scopes: any[] };

      const scopes = result.scopes.map((scope: any) => {
        return new Scope(
          scope.name,
          scope.variablesReference,
          scope.expensive
        );
      });

      response.body = {
        scopes
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 16,
        format: `Error getting scopes: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Get variables for a scope
   */
  override async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): Promise<void> {
    try {
      const variablesReference = args.variablesReference;
      const result = await this.client.sendRequest('nwscript/debug/variables', { variablesReference }) as { variables: any[] };

      const variables = result.variables.map((v: any) => {
        return new Variable(
          v.name,
          v.value,
          v.type,
          v.variablesReference
        );
      });

      response.body = {
        variables
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 17,
        format: `Error getting variables: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Evaluate an expression
   */
  override async evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): Promise<void> {
    try {
      const result = await this.client.sendRequest('nwscript/debug/evaluate', {
        expression: args.expression,
        frameId: args.frameId
      }) as { result: string; variablesReference: number };

      response.body = {
        result: result.result,
        variablesReference: result.variablesReference
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 18,
        format: `Error evaluating expression: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Terminate the debug session
   */
  override async disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments): Promise<void> {
    try {
      await this.client.sendRequest('nwscript/debug/stop', {});
      this.sendResponse(response);
      this.sendEvent(new TerminatedEvent());
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 19,
        format: `Error stopping debug session: ${error}`,
        showUser: true
      });
    }
  }

  /**
   * Get list of threads (we only support one thread)
   */
  override threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    response.body = {
      threads: [
        new Thread(NWScriptDebugAdapter.threadID, "Main Thread")
      ]
    };
    this.sendResponse(response);
  }
}

/**
 * Factory that creates debug adapter descriptor
 */
export class NWScriptDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory, vscode.Disposable {
  private client: LanguageClient;
  private disposables: vscode.Disposable[] = [];

  constructor(client: LanguageClient) {
    this.client = client;
  }

  createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    const debugAdapter = new NWScriptDebugAdapter(this.client);
    return new vscode.DebugAdapterInlineImplementation(debugAdapter);
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}

/**
 * Debug configuration provider for NWScript
 */
export class NWScriptConfigurationProvider implements vscode.DebugConfigurationProvider {
  /**
   * Provide initial debug configurations for 'Add Debug Configuration'
   */
  provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined): vscode.ProviderResult<vscode.DebugConfiguration[]> {
    return [
      {
        type: 'nwscript',
        request: 'launch',
        name: 'Debug NWScript',
        script: '${file}'
      }
    ];
  }

  /**
   * Resolve debug configuration
   */
  resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration): vscode.ProviderResult<vscode.DebugConfiguration> {
    // If launch.json is missing or empty
    if (!config.type && !config.request && !config.name) {
      return {
        type: 'nwscript',
        request: 'launch',
        name: 'Debug NWScript',
        script: '${file}'
      };
    }

    // Ensure required fields exist
    if (!config.script) {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === 'nwscript') {
        config.script = editor.document.uri.fsPath;
      } else {
        return vscode.window.showInformationMessage('Cannot find an active NWScript file to debug').then(_ => {
          return undefined; // abort launch
        });
      }
    }

    return config;
  }
}

/**
 * Debug adapter tracker factory for NWScript
 */
export class NWScriptDebugAdapterTrackerFactory implements vscode.DebugAdapterTrackerFactory {
  createDebugAdapterTracker(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterTracker> {
    return {
      onDidSendMessage(message: any): void {
        // Track debug adapter messages if needed
      },
      onWillReceiveMessage(message: any): void {
        // Track incoming messages if needed
      },
      onWillStartSession(): void {
        console.log('Starting debug session');
      },
      onWillStopSession(): void {
        console.log('Stopping debug session');
      },
      onError(error: Error): void {
        console.error('Debug adapter error:', error);
      },
      onExit(code: number | undefined, signal: string | undefined): void {
        console.log(`Debug adapter exit: code=${code}, signal=${signal}`);
      }
    };
  }
}