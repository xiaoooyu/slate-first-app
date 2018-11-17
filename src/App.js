// Import React!
import React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'

// Create our initial value...
const initialValue = Value.fromJSON({
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

class App extends React.Component {
  // Set the initial value when the app is first constructed.
  state = {
    value: initialValue
  }

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    this.setState({value})
  }

  onKeyDown = (event, editor, next) => {
    if (!event.ctrlKey) return next()

    switch (event.key) {
      case 'b': 
        event.preventDefault()
        editor.toggleMark('bold')
        return true
      case '`':
        event.preventDefault()
        // Determine whether any of the currently selected blocks are code block 
        const isCode = editor.value.blocks.some(block => block.type === 'code') 
        // 
        editor.setBlocks(isCode ? 'paragraph' : 'code')
        return true
      default:
        return next()
    }   
  }
    
  render() {
    return <Editor value={this.state.value}
      onChange={this.onChange}
      onKeyDown={this.onKeyDown}
      renderNode={this.renderNode}
      renderMark={this.renderMark}
    />
  }

  renderNode = (props, editor, next) => {
    switch (props.node.type) {
      case 'code':
        return <CodeNode {...props} />
      default:
        return next()
    }
  }

  renderMark = (props, editor, next) => {
    switch (props.mark.type) {
      case 'bold':
        return <BoldMark {...props} />
      default:
        return next()
    }
  }
}

function CodeNode(props) {
  return (<pre {...props.attributes}>
    <code>{props.children}</code>
  </pre>)
}

function BoldMark(props) {
  return <strong>{props.children}</strong>
}

export default App;
