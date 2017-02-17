import React from 'react'
import { Editor, Html } from 'slate'
import autoBind from 'react-autobind'
import { debounce } from '../../../lib/utils.js'
import { DragSource } from 'react-dnd'
import ItemTypes from './ItemTypes.js'

const DEFAULT_NODE = 'paragraph'

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
	nodes: {
		'heading-one': props => <h1 {...props.attributes}>{props.children}</h1>,
		'heading-two': props => <h2 {...props.attributes}>{props.children}</h2>,
		'heading-three': props => <h3 {...props.attributes}>{props.children}</h3>,
		'heading-four': props => <h4 {...props.attributes}>{props.children}</h4>,
		'heading-five': props => <h5 {...props.attributes}>{props.children}</h5>,
		'heading-six': props => <h6 {...props.attributes}>{props.children}</h6>,
		'bulleted-list': props => <ul {...props.attributes}>{props.children}</ul>,
		'numbered-list': props => <ol {...props.attributes}>{props.children}</ol>,
		'list-item': props => <li {...props.attributes}>{props.children}</li>,
		'image': props => {
			const { node, state } = props
			const isFocused = state.selection.hasEdgeIn(node)
			const src = node.data.get('src')
			const className = isFocused ? 'active' : null
			return (
				<img sxc={src} className={className} {...props.attributes} />
			)
		},
		'link': props => {
			const { data } = props.node
			const href = data.get('href')
			return <a {...props.attributes} href={href}>{props.children}</a>
		}
	},
	marks: {
		bold: props => <strong>{props.children}</strong>,
		italic: props => <em>{props.children}</em>,
	}
}

const BLOCK_TAGS = {
	p: 'paragraph',
	h1: 'heading-one',
	h2: 'heading-two',
	h3: 'heading-three',
	h4: 'heading-four',
	h5: 'heading-five',
	h6: 'heading-six',
	div: 'div',
	li: 'list-item',
	ul: 'bulleted-list',
	ol: 'numbered-list',
	table: 'table',
	tr: 'table-row',
	td: 'table-cell',
	th: 'table-header',
	img: 'image',
	a: 'link'
}

const MARK_TAGS = {
	em: 'italic',
	strong: 'bold',
}

// const RULES = [
// 	{
// 		deserialize(el, next) {
// 			const block = BLOCK_TAGS[el.tagName]
// 			if (!block) return
// 			return {
// 				kind: 'block',
// 				type: block,
// 				nodes: next(el.children)
// 			}
// 		}
// 	},
// 	{
// 		deserialize(el, next) {
// 			const mark = MARK_TAGS[el.tagName]
// 			if (!mark) return
// 			return {
// 				kind: 'mark',
// 				type: mark,
// 				nodes: next(el.children)
// 			}
// 		}
// 	},
// 	{
// 		// Special case for code blocks, which need to grab the nested children.
// 		deserialize(el, next) {
// 			if (el.tagName != 'pre') return
// 			const code = el.children[0]
// 			const children = code && code.tagName == 'code'
// 				? code.children
// 				: el.children

// 			return {
// 				kind: 'block',
// 				type: 'code',
// 				nodes: next(children)
// 			}
// 		}
// 	},
// 	{
// 		// Special case for links, to grab their href.
// 		deserialize(el, next) {
// 			if (el.tagName != 'a') return
// 			return {
// 				kind: 'inline',
// 				type: 'link',
// 				nodes: next(el.children),
// 				data: {
// 					href: el.attribs.href
// 				}
// 			}
// 		}
// 	}
// ]


const rules = [
	// block rules only
	// {
	// 	deserialize(el, next) {
	// 		const type = BLOCK_TAGS[el.tagName]
	// 		if(!type) return
	// 		return {
	// 			kind: 'block',
	// 			type: type,
	// 			// data: el.data ? el.data : [],
	// 			nodes: next(el.children)
	// 		}
	// 	},
	// },
	{
		deserialize(el, next) {
			const block = BLOCK_TAGS[el.tagName]
			if (!block) return
			return {
				kind: 'block',
				type: block,
				nodes: next(el.children)
			}
		}
	},
	{
		deserialize(el, next) {
			const mark = MARK_TAGS[el.tagName]
			if (!mark) return
			return {
				kind: 'mark',
				type: mark,
				nodes: next(el.children)
			}
		}
	},
	{
		// Special case for links, to grab their href.
		deserialize(el, next) {
			if (el.tagName != 'a') return
			return {
				kind: 'inline',
				type: 'link',
				nodes: next(el.children),
				data: {
					href: el.attribs.href
				}
			}
		}
	},
	{
		serialize(object, children) {
			if (object.kind != 'block') return
			switch (object.type) {
			case 'heading-one': return <h1>{children}</h1>
			case 'heading-two': return <h2>{children}</h2>
			case 'heading-three': return <h3>{children}</h3>
			case 'heading-four': return <h4>{children}</h4>
			case 'heading-five': return <h5>{children}</h5>
			case 'heading-six': return <h6>{children}</h6>
			case 'paragraph': return <p>{children}</p>
			case 'numbered-list' : return <ol>{children}</ol>
			case 'bulleted-list': return <ul>{children}</ul>
			case 'list-item': return <li>{children}</li>
			case 'table': return <table>{children}</table>
			case 'table-row': return <tr>{children}</tr>
			case 'table-cell' : return <td>{children}</td>
			case 'table-header': return <th>{children}</th>
			case 'image': props => {
				const { data } = props.node
				const src = data.get('src')
				return <img src={src} />
			}
			case 'link': props => {
				const { data } = props.node
				const href = data.get('href')
				return <a href={href} {...props.attributes}>{children}</a>
			}
			}
		}
	},
	// {
	// 	// Special case for links, to grab their href.
	// 	deserialize(el, next) {
	// 		if (el.tagName != 'a') return
	// 		return {
	// 			kind: 'inline',
	// 			type: 'link',
	// 			nodes: next(el.children),
	// 			data: {
	// 				href: el.attribs.href
	// 			}
	// 		}
	// 	}
	// },
	// {
	// 	deserialize(el, next) {
	// 		const type = MARK_TAGS[el.tagName]
	// 		if (!type) return
	// 		return {
	// 			kind: 'mark',
	// 			type: type,
	// 			nodes: next(el.children)
	// 		}
	// 	},
	// 	serialize(object, children) {
	// 		if (object.kind != 'mark') return
	// 		switch (object.type) {
	// 		case 'bold': return <strong>{children}</strong>
	// 		case 'italic': return <em>{children}</em>
	// 		}
	// 	}
	// }
]

const defaultEditorSource = {
	beginDrag(props) {
		return {
			text: props.text,
			index: props.index
		}
	},
	endDrag(props) {
		return {
			text: props.text,
			index: props.index
		}
	},
	canDrag(props) {
		return props.isEditModeActive
	}
}

function collect(connect, monitor) {
	return {
		connectDragSource : connect.dragSource(),
		isDragging: monitor.isDragging()
	}
}

let html = new Html({ rules })

class DefaultEditor extends React.Component {

	constructor(props) {
		super(props)

		autoBind(this,
			'onChange',
			'onDocumentChange',
			'onTitleChange',
			'onKeyDown',
			'onClickBlock',
			'onClickLink',
			'onClickMark',
			'renderBlockButton',
			'hasLinks'
		)

		this.debounceDocChange = debounce(this.onDocumentChange, 500)

		this.state = {
			state: html.deserialize(this.props.content)
		}
	}

	//class methods
	componentWillReceiveProps(nextProps) {
		let content = html.deserialize(nextProps.content)
		this.setState(() => {
			this.state.state = content 
		}) 
	}

	/**
	 * Check whether the current selection has a link in it.
	 *
	 * @return {Boolean} hasLinks
	 */

	hasLinks() {
		const { state } = this.state
		return state.inlines.some(inline => inline.type == 'link')
	}

 /**
	 * Check if the current selection has a mark with `type` in it.
	 *
	 * @param {String} type
	 * @return {Boolean}
	 */

	hasMark(type) {
		const { state } = this.state
		return state.marks.some(mark => mark.type == type)
	}

	/**
	 * Check if the any of the currently selected blocks are of `type`.
	 *
	 * @param {String} type
	 * @return {Boolean}
	 */

	hasBlock(type) {
		const { state } = this.state
		return state.blocks.some(node => node.type == type)
	}

	/**
	 * On key down, if it's a formatting command toggle a mark.
	 *
	 * @param {Event} e
	 * @param {Object} data
	 * @param {State} state
	 * @return {State}
	 */

	onKeyDown(e, data, state) {
		if (!data.isMod) return
		let mark

		switch (data.key) {
		case 'b':
			mark = 'bold'
			break
		case 'i':
			mark = 'italic'
			break
		default:
			return
		}

		state = state
			.transform()
			.toggleMark(mark)
			.apply()

		e.preventDefault()
		return state
	}

	/**
	 * When a mark button is clicked, toggle the current mark.
	 *
	 * @param {Event} e
	 * @param {String} type
	 */

	onClickMark(e, type) {
		e.preventDefault()
		let { state } = this.state

		state = state
			.transform()
			.toggleMark(type)
			.apply()

		this.setState({ state })
	}

	/**
	 * When a block button is clicked, toggle the block type.
	 *
	 * @param {Event} e
	 * @param {String} type
	 */

	onClickBlock(e, type) {
		e.preventDefault()
		let { state } = this.state
		let transform = state.transform()
		const { document } = state

		// Handle everything but list buttons.
		if (type != 'bulleted-list' && type != 'numbered-list') {
			const isActive = this.hasBlock(type)
			const isList = this.hasBlock('list-item')

			if (isList) {
				transform
					.setBlock(isActive ? DEFAULT_NODE : type)
					.unwrapBlock('bulleted-list')
					.unwrapBlock('numbered-list')
			}

			else {
				transform
					.setBlock(isActive ? DEFAULT_NODE : type)
			}
		}
		// Handle the extra wrapping required for list buttons.
		else {
			const isList = this.hasBlock('list-item')
			const isType = state.blocks.some((block) => {
				return !!document.getClosest(block.key, parent => parent.type == type)
			})

			if (isList && isType) {
				transform
					.setBlock(DEFAULT_NODE)
					.unwrapBlock('bulleted-list')
					.unwrapBlock('numbered-list')
			} else if (isList) {
				transform
					.unwrapBlock(type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list')
					.wrapBlock(type)
			} else {
				transform
					.setBlock('list-item')
					.wrapBlock(type)
			}
		}

		state = transform.apply()
		this.setState({ state })
	}

	onClickLink(e) {
		e.preventDefault()
		let { state } = this.state
		const hasLinks = this.hasLinks()

		if (hasLinks) {
			state = state
				.transform()
				.unwrapInline('link')
				.apply()
		}

		else if (state.isExpanded) {
			const href = window.prompt('Enter the URL of the link:')
			state = state
				.transform()
				.wrapInline({
					type: 'link',
					data: { href }
				})
				.collapseToEnd()
				.apply()
		}

		else {
			const href = window.prompt('Enter the URL of the link:')
			const text = window.prompt('Enter the text for the link:')
			state = state
				.transform()
				.insertText(text)
				.extendBackward(text.length)
				.wrapInline({
					type: 'link',
					data: { href }
				})
				.collapseToEnd()
				.apply()
		}

		this.setState({ state })	
	}

	onClickImageButton() {
		// popup modal that says insert image from: gallery, external source
		// if gallery, render gallery
		// if external, enter url
		// dispatch event to render modal
		let toggleImagePromptModal = new CustomEvent('toggleVisible', {
			detail: 'isImagePromptModalVisible'
		})
		window.dispatchEvent(toggleImagePromptModal)
	}
	

	onPaste(e, data, state) {
		if (data.type != 'html') return
		if (data.isShift) return

		const { document } = serializer.deserialize(data.html)

		return state
			.transform()
			.insertFragment(document)
			.apply()
	}

	onChange(state) {
		this.setState({state})
	}

	onDocumentChange(document, state) {
		let updatedContent = html.serialize(state)
		this.props.updateContentValue(updatedContent, this.props.index)
	}

	onTitleChange(event) {
		event.persist()
		this.setState({title: event.target.value})
		let title = event.target.value
		if(this.props.updateComponentTitle) {
			this.props.updateComponentTitle(title, this.props.index)
		}
	}

	renderMarkButton(type, icon) {
		const isActive = this.hasMark(type)
		const onMouseDown = e => this.onClickMark(e, type)

		return (
			<button className="button" onMouseDown={onMouseDown} data-active={isActive}>
				<span className="icon is-medium material-icons">{icon}</span>
			</button>
		)
	}

	renderLinkButton(type, icon) {
		const hasLinks = this.hasLinks()

		return (
			<span className="button" onMouseDown={this.onClickLink} data-active={hasLinks}>
				<span className="material-icons">{icon}</span>
			</span>
		)
	}

	renderBlockButton(type, icon) {
		const isActive = this.hasBlock(type)
		const onMouseDown = e => this.onClickBlock(e, type)

		return (
			<button className="button" onMouseDown={onMouseDown} data-active={isActive}>
				<span className="icon is-medium material-icons">{icon}</span>
			</button>
		)
	}

	renderImageButton(type, icon) {
		const isActive = this.hasBlock(type)
		const onMouseDown = e => this.onClickImageButton(e)

		return (
			<button className="button" onMouseDown={onMouseDown} data-active={isActive}>
				<span className="material-icons">{icon}</span>
			</button>
		)
	}

	renderToolbar() {
		return (
			<div className="slate-editor__toolbar">
				{this.renderMarkButton('bold', 'format_bold')}
				{this.renderMarkButton('italic', 'format_italic')}
				{this.renderBlockButton('heading-one', 'looks_one')}
				{this.renderBlockButton('heading-two', 'looks_two')}
				{this.renderBlockButton('numbered-list', 'format_list_numbered')}
				{this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
				{this.renderLinkButton('link', 'link')}
				{this.renderImageButton('image', 'image')}
			</div>
		)
	}

	renderEditor() {
		return (
			<Editor
				className="content"
				spellCheck
				state={this.state.state}
				schema={schema}
				onKeyDown={this.onKeyDown}
				onDocumentChange={this.debounceDocChange}
				onChange={this.onChange}
				onPaste={this.onPaste}
			/>
		)
	}

	render() {
		const { connectDragSource } = this.props
		return connectDragSource(
			<div className="box slate-editor">
				<div className="slate-editor__title">
					<label>Section Title</label>
					<input className="input" type="text" value={this.props.componentTitle} onChange={this.onTitleChange} />
				</div>
				{this.renderToolbar()}
				{this.renderEditor()}
			</div>
		)
	}
}

DefaultEditor.propTypes = {
	componentTitle: React.PropTypes.string,
	content: React.PropTypes.string,
	connectDragSource: React.PropTypes.func,
	index: React.PropTypes.number,
	updateComponentTitle: React.PropTypes.func,
	updateContentValue: React.PropTypes.func
}

export default DragSource(ItemTypes.DEFAULTEDITOR, defaultEditorSource, collect)(DefaultEditor)