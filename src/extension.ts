import * as vscode from 'vscode';
import Color2Color from './C2C/Color2Color';

export function activate(context: vscode.ExtensionContext) {
  const c2c = new Color2Color(context);

  c2c.register();
}

export function deactivate() {}
