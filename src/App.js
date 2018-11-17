// Import React!
import React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'

const existingValue = JSON.parse(localStorage.getItem('content'))
// Create our initial value...
const initialValue = Value.fromJSON(existingValue || {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a parapraph.',
              }
            ]
          }
        ]
      }
    ]
  }
})

function MarkHotkey(options) {
  // Grab our options from the ones passed in.
  const { type, key } = options

  // Return our "plugin" object, containing the 'onKeyDown' handler
  return {
    onKeyDown(event, editor, next) {
      // If it doesn't match our `key`, let other plugins handle it.
      if(!event.ctrlKey || event.key !== key) return next()

      // Prevent the default characters from being inserted.
      event.preventDefault()

      // Toggle the mark `type`
      editor.toggleMark(type)
    }
  }
}

const plugins = [
  MarkHotkey({key: 'b', type: 'bold'}),
  MarkHotkey({key: '`', type: 'code'}),
  MarkHotkey({key: 'i', type: 'italic'}),
  MarkHotkey({key: 'd', type: 'strikethrough'}),
  MarkHotkey({key: 'u', type: 'underline'}),
]

class App extends React.Component {
  // Set the initial value when the app is first constructed.
  state = {
    value: initialValue
  }

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    if (value.document !== this.state.value.document) {
      const content = JSON.stringify(value.toJSON())
      localStorage.setItem('content', content)
    }    
    
    this.setState({value})
  }  
    
  render() {
    return <Editor value={this.state.value}      
      plugins={plugins}
      onChange={this.onChange}      
      renderMark={this.renderMark}
    />
  }  

  renderMark = (props, editor, next) => {
    switch (props.mark.type) {
      case 'bold':
        return <strong>{props.children}</strong>
      case 'code':
        return <code>{props.children}</code>
      case 'italic':
        return <em>{props.children}</em>
      case 'strikethrough':
        return <del>{props.children}</del>
      case 'underline':
        return <u>{props.children}</u>
      default:
        return next()
    }
  }
}

export default App;
