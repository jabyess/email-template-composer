import React from 'react'
import autoBind from 'react-autobind'

class EditorMetaContainer extends React.Component {

	constructor(props) {
		super(props)

		autoBind(this, 
		'handleTitleChange',
		'handleTemplateChange',
		'handleCategoryChange'
		)

		this.state = {}
	}

	handleTemplateChange(event) {
		if(this.props.handleTemplateChange) {
			this.props.handleTemplateChange(event.target.value)
		}
	}

	handleTitleChange(event) {
		if(this.props.handleTitleChange) {
			event.persist()
			this.props.handleTitleChange(event.target.value)
		}
	}

	handleCategoryChange(event) {
		if(this.props.updateCategory) {
			this.props.updateCategory(event.target.value)
		}
	}

	// componentWillReceiveProps (nextProps) {
	// 	this.setState({
	// 		title: nextProps.title,
	// 		template: nextProps.template,
	// 		category: nextProps.category
	// 	})
	// }
		
	render() {
		return (
			<div className="panel">
				<div className="panel-heading">Details</div>
				<div className="panel-block">ID: {this.props._id}</div>
				<div className="panel-block">Created At: {this.props.createdAt}</div>
				<div className="panel-block">Updated At: {this.props.updatedAt}</div>
				<div className="panel-block">
					<span>Category</span>
					<select 
						name="category"
						className="select is-medium"
						onChange={this.handleCategoryChange}
						value={this.props.category}
						>
						<option disabled>--Select a Category--</option>
						{this.props.categories.map((cat, i) => {
							return (
								<option value={cat.name} key={i}>
									{cat.name}
								</option>
							)
						})}
					</select>
				</div>
				<div className="panel-block">
					<span>Template: </span>
					<select
						className="select is-medium email-meta--template"
						name="EmailTemplate"
						onChange={this.handleTemplateChange}
						value={this.props.template}>
						<option disabled>--Select a Template--</option>
						{this.props.templates.map((cv, i) => {
							return <option value={cv} key={i}>{cv}</option>
						})}
					</select>
				</div>
				<div className="panel-block">
					<span>Title: </span>
					<input className="input"
						type="text"
						value={this.props.title}
						onChange={this.handleTitleChange}
					/>
				</div>
			</div> 
		)
	}

}

EditorMetaContainer.propTypes = {
	createdAt: React.PropTypes.string,
	updatedAt: React.PropTypes.string,
	templates: React.PropTypes.array,
	template: React.PropTypes.string,
	title: React.PropTypes.string,
	handleTemplateChange: React.PropTypes.func,
	handleTitleChange: React.PropTypes.func,
	updateCategory: React.PropTypes.func
}

export default EditorMetaContainer