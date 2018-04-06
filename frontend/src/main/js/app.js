const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {posts: []};
	}

	componentDidMount() {
		client({method: 'GET', path: '/api/posts'}).then(response => {
			this.setState({posts: response.entity._embedded.posts});
		});
	}

	render() {
		return (
			<Posts posts={this.state.posts}/>
		)
	}
}

class Posts extends React.Component{
	render() {
		var posts = this.props.posts.map(post =>
			<Post key={post._links.self.href} post={post}/>
		);
		return (
		  <div>
        <h1> Testing 3 </h1>
        <table>
          <tbody>
            <tr>
              <th>Title</th>
              <th>Body</th>
            </tr>
            {posts}
          </tbody>
        </table>
      </div>
		)
	}
}

class Post extends React.Component{
	render() {
		return (
			<tr>
				<td>{this.props.post.title}</td>
				<td>{this.props.post.body}</td>
			</tr>
		)
	}
}

ReactDOM.render( <App />, document.getElementById('react') )
