// Import React!
import React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'

import Html from 'slate-html-serializer'

// Create our initial value...
const initialValue = localStorage.getItem('html') || '<p>A line of text in a paragraph.</p>'

const BLOCK_TAGS = {
  p: 'paragraph',
  blockquote: 'quote',
  pre: 'code',
}

const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
}

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

      if(type === 'italic' || type === 'bold' || type === 'underline') {
        // Toggle the mark `type`
        editor.toggleMark(type)
      } else {
        const hasSet = editor.value.blocks.some(block => block.type === type)
        editor.setBlocks(hasSet ? 'paragraph' : type)
      }
    }
  }
}

const plugins = [
  MarkHotkey({key: 'b', type: 'bold'}),
  MarkHotkey({key: '`', type: 'code'}),
  MarkHotkey({key: 'i', type: 'italic'}),
  MarkHotkey({key: 'd', type: 'strikethrough'}),
  MarkHotkey({key: 'u', type: 'underline'}),
  MarkHotkey({key: 'q', type: 'quote'}),
]

const rules = [
  // Add our first rule with a deserializing function
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: 'block',
          type: type,
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        }
      }            
    },
    serialize(obj, children) {
      if (obj.object === 'block'){
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>
          case 'quote':
            return <blockquote>{children}</blockquote>
          case 'code':
            return (
              <pre><code>{children}</code></pre>
            )
          default: 
            break
        }
      } 
    }
  },
  // Add a new rule that handles marks
  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()]
      if(type) {
        return {
          object: 'mark',
          type: type,
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if(obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>
          case 'italic':
            return <em>{children}</em>
          case 'strikethrough':
            return <del>{children}</del>
          case 'underline':
            return <u>{children}</u>
          default:
            break
        }
      }
    }
  }
]
const html = new Html({ rules })

class App extends React.Component {
  // Set the initial value when the app is first constructed.
  state = {
    value: html.deserialize(initialValue)
  }

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    if (value.document !== this.state.value.document) {
      const string = html.serialize(value)
      localStorage.setItem('html', string)
    }    
    
    this.setState({ value })
  }  
    
  render() {
    return <Editor value={this.state.value}      
      plugins={plugins}
      onChange={this.onChange}      
      renderMark={this.renderMark}
      renderNode={this.renderNode}
    />
  }  

  renderMark = (props, editor, next) => {
    switch (props.mark.type) {
      case 'bold':
        return <strong>{props.children}</strong>      
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

  renderNode = (props, editor, next) => {
    switch (props.node.type) {
      case 'code':
        return (
          <pre {...props.attributes}>
            <code>{props.children}</code>
          </pre>
        )
      case 'paragraph':
        return (
          <p {...props.attributes} className={props.node.data.get('className')}>
            {props.children}
          </p>
        )
      case 'quote':
        return <blockquote {...props.attributes}>{props.children}</blockquote>
      default:
        return next()
    }
  }
}

export default App;
