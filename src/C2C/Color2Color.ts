import * as vscode from 'vscode';
import { CODELENS, DEFAULT_FILES, EXT_NAME, LANG } from '../utils/constant';
import { hexToRgb, isHexColor, isRgbColor, rgbToHex } from '../utils/colorTrans';
import ColorCodeLensProvider from './ColorCodeLens';

export default class Color2Color {
  context: vscode.ExtensionContext;
  codelensDisposable: vscode.Disposable | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  enableFileConfig() {
    const config = vscode.workspace.getConfiguration(EXT_NAME);
    const enable = config.get<boolean>(CODELENS, true);

    if (enable) {
      this.registerCodeLensProvider(config);
    }

    // 如果想要在设置修改后自动重新注册，可以额外监听配置变更：
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(`${EXT_NAME}.${CODELENS}`)) {
        const newEnable = vscode.workspace.getConfiguration(EXT_NAME).get<boolean>(CODELENS, true);

        if (newEnable && !this.codelensDisposable) {
          this.registerCodeLensProvider(config);
        } else if (!newEnable && this.codelensDisposable) {
          this.codelensDisposable.dispose();
          this.codelensDisposable = undefined;
        }
      }

      if (e.affectsConfiguration(`${EXT_NAME}.${LANG}`)) {
        this.codelensDisposable?.dispose();
        const newLangs = config.get<string[]>(LANG) ?? [];
        const newSelectors = newLangs.map(lang => ({ language: lang, scheme: 'file' }));
        this.context.subscriptions.push(
          vscode.languages.registerCodeLensProvider(newSelectors, new ColorCodeLensProvider())
        );
      }
    });
  }

  registerCodeLensProvider(config: vscode.WorkspaceConfiguration) {
    const langs = config.get<string[]>(LANG);

    const languages = langs && langs.length ? langs : DEFAULT_FILES;

    const selectors: vscode.DocumentSelector = languages.map(lang => ({
      language: lang,
      scheme: 'file',
    }));

    this.codelensDisposable = vscode.languages.registerCodeLensProvider(
      selectors,
      new ColorCodeLensProvider()
    );

    this.context.subscriptions.push(this.codelensDisposable);
  }

  enableCodLensCommand() {
    // 注册命令
    const disposableCommand = vscode.commands.registerCommand(
      `${EXT_NAME}.convert`,
      async (arg: { colorCode: string; range: vscode.Range }) => {
        if (!arg) {
          return;
        }

        const { colorCode, range } = arg;
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
          vscode.window.showErrorMessage('No active editor!');
          return;
        }

        const converted = await this.colorConvert(colorCode);

        if (!converted) {
          return;
        }

        // 替换文档中的文字
        editor
          .edit(editBuilder => {
            editBuilder.replace(range, converted);
          })
          .then(success => {
            if (success) {
              vscode.window.showInformationMessage(`"${colorCode}" to "${converted}"`);
            }
          });
      }
    );

    this.context.subscriptions.push(disposableCommand);
  }

  enableSelectedCommand() {
    // 注册一个命令：myExtension.replaceSelectedText
    let disposable = vscode.commands.registerCommand(`${EXT_NAME}.selectedConvert`, async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage('No active editor!');
        return;
      }

      // 2. 获取编辑器中的选区（如果没选中，则 selection 是光标位置）
      const selection = editor.selection;

      // 3. 读取选中内容
      const selectedText = editor.document.getText(selection);

      const converted = await this.colorConvert(selectedText, false);

      if (!converted) {
        return;
      }

      // 5. 应用编辑操作，把新的文本写回到原选区
      editor
        .edit(editBuilder => {
          editBuilder.replace(selection, converted);
        })
        .then(success => {
          if (!success) {
            vscode.window.showErrorMessage('Failed to convert color!');
          }
        });
    });

    this.context.subscriptions.push(disposable);
  }

  async colorConvert(code: string, needPick: boolean = true): Promise<string> {
    let type: 'hex' | 'rgb' | null = null;
    let converted = code;

    if (isHexColor(code)) {
      type = 'hex';
    } else if (isRgbColor(code)) {
      type = 'rgb';
    }

    if (!type) {
      vscode.window.showErrorMessage(`"${code}" Not a valid HEX or RGB color value!`);
      return '';
    }

    if (needPick) {
      let picks: string[] = [];
      if (type === 'hex') {
        picks = ['Hex2Rgb'];
      } else {
        picks = ['Rgb2Hex'];
      }

      const choice = await vscode.window.showQuickPick(picks, {
        placeHolder: 'Please choose the conversion method',
      });

      if (!choice) {
        return '';
      }

      // 执行转换
      if (choice === 'Hex2Rgb') {
        converted = hexToRgb(code);
      } else if (choice === 'Rgb2Hex') {
        converted = rgbToHex(code);
      }
      return converted;
    }

    if (type === 'hex') {
      converted = hexToRgb(code);
    } else if (type === 'rgb') {
      converted = rgbToHex(code);
    } else {
      converted = '';
    }

    return converted;
  }

  register() {
    this.enableFileConfig();
    this.enableCodLensCommand();
    this.enableSelectedCommand();
  }
}
