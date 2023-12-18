// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')

const defaultEmojiList = require('./emoji')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "emoji-log" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'extension.emoji-log',
    function () {
      const editor = vscode.window.activeTextEditor
      const config = vscode.workspace.getConfiguration('Emoji Log')

      const userEmojiList = config.get('emojiList')
      const emojis =
        userEmojiList.length > 0 ? userEmojiList : defaultEmojiList

      const logFormat = config.get('logFormat')

      const cursorTemplate = '$CURSOR'
      const emojiTemplate = '$EMOJI'

      const emoji = emojis[Math.floor(Math.random() * emojis.length)]

      if (editor) {
        const selectionIsEmpty = editor.selection.isEmpty
        editor
          .edit((edit) => {
            if (selectionIsEmpty) {
              edit.insert(
                editor.selection.active,
                logFormat
                  .replace(cursorTemplate, '')
                  .replace(emojiTemplate, emoji)
              )
            } else {
              const currentSelection = editor.document.getText(editor.selection)
              const currentLine = editor.document.lineAt(editor.selection.start)
              const currentLineText = currentLine.text

              const emojiLog = logFormat
                .replace(cursorTemplate, currentSelection)
                .replace(emojiTemplate, emoji)

              edit.replace(
                currentLine.rangeIncludingLineBreak,
                `${currentLineText}\n${emojiLog}\n`
              )
            }
          })
          .then(() => {
            const cursor = editor.selection.active
            if (selectionIsEmpty) {
              const logFormatWithEmoji = logFormat.replace(
                emojiTemplate,
                emoji
              )

              const cursorDistanceFromEnd =
                logFormatWithEmoji.length -
                logFormatWithEmoji.indexOf(cursorTemplate) -
                cursorTemplate.length

              const nextCursor = cursor.with(
                cursor.line,
                cursor.character - cursorDistanceFromEnd
              )

              editor.selection = new vscode.Selection(nextCursor, nextCursor)
            } else {
              editor.selection = new vscode.Selection(
                editor.selection.start,
                editor.selection.end
              )

              // Format document after adding new line
              vscode.commands.executeCommand('editor.action.formatDocument')
            }
          })
      }
    }
  )

  context.subscriptions.push(disposable)
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
