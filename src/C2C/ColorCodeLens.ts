import * as vscode from 'vscode';
import { colorReg } from '../utils/regex';
import { EXT_NAME } from '../utils/constant';
export default class ColorCodeLensProvider implements vscode.CodeLensProvider {
  private regex = colorReg;

  public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const text = document.getText();
    const codeLenses: vscode.CodeLens[] = [];

    let match;
    while ((match = this.regex.exec(text)) !== null) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);
      const colorCode = match[0];

      // 创建一个 CodeLens
      const command: vscode.Command = {
        title: 'c2c', // 按钮文案，可用一些符号如 "⚙" or "🔍"
        command: `${EXT_NAME}.convert`, // 触发的命令
        arguments: [{ colorCode, range }], // 传给命令的参数，比如匹配到的色值
      };

      codeLenses.push(new vscode.CodeLens(range, command));
    }
    return codeLenses;
  }
}
