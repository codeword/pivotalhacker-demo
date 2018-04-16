'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
const follow = require('./follow');
const root = '/api';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {posts: [], attributes: [], pageSize: 2, links: {}};
    this.updatePageSize = this.updatePageSize.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
  }

  loadFromServer(pageSize) {
    const followRet = follow(client, root, [
      {rel: 'posts', params: {size: pageSize}}
    ]);

    console.log("followRet: ", followRet);
    const then1Ret = followRet.then(results => {
      return client({
        method: 'GET',
        path: results.entity._links.profile.href,
        headers: {'Accept': 'application/schema+json'}
      }).then(schema => {
        this.schema = schema.entity;
        return results;
      });
    });
    console.log("then1Ret: ", then1Ret);
    const doneRet = then1Ret.then(results => {
      this.setState({
        posts: results.entity._embedded.posts,
        attributes: Object.keys(this.schema.properties),
        pageSize: pageSize,
        links: results.entity._links});
    });
    console.log("doneRet:", doneRet);
  }

  onCreate(newPost) {
    follow(client, root, ['posts']).then(results => {
      return client({
        method: 'POST',
        path: results.entity._links.self.href,
        entity: newPost,
        headers: {'Content-Type': 'application/json'}
      })
    }).then(results => {
      return follow(client, root, [
        {rel: 'posts', params: {'size': this.state.pageSize}}
      ]);
    }).done(results => {
      if (typeof results.entity._links.last != 'undefined') {
        this.onNavigate(results.entity._links.last.href);
      } else {
        this.onNavigate(results.entity._links.self.href);
      }
    });
  }

  onDelete(post) {
    client({method: 'DELETE', path: post._links.self.href}).done(response => {
      this.loadFromServer(this.state.pageSize);
    });
  }

  onNavigate(navUri) {
    client({method: 'GET', path: navUri}).done(results => {
      this.setState({
        posts: results.entity._embedded.posts,
        attributes: this.state.attributes,
        pageSize: this.state.pageSize,
        links: results.entity._links
      });
    });
  }

  updatePageSize(pageSize) {
    if (pageSize !== this.state.pageSize) {
      this.loadFromServer(pageSize);
    }
  }

  componentDidMount() {
    this.loadFromServer(this.state.pageSize);
  }

  render() {
    return (
      <div>
        <CreatePost attributes={this.state.attributes} onCreate={this.onCreate}/>
        <Posts
          posts={this.state.posts}
          links={this.state.links}
          pageSize={this.state.pageSize}
          onNavigate={this.onNavigate}
          onDelete={this.onDelete}
          updatePageSize={this.updatePageSize}
        />
      </div>
    )
  }
}

class CreatePost extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const newPost = {};
    this.props.attributes.forEach(attribute => {
      newPost[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
    });

    this.props.onCreate(newPost);

    this.props.attributes.forEach(attribute => {
      ReactDOM.findDOMNode(this.refs[attribute]).value = '';
    });

    window.location = '#';
  }

  render() {
    const inputs = this.props.attributes.map(attribute =>
      <p key={attribute}>
        <input type="text" placeholder={attribute} ref={attribute} className="field" />
      </p>
    );

    return (
      <div>
        <a href="#createPost">Create</a>

        <div id="createPost" className="modalDialog">
          <div>
            <a href="#" title="Close" className="close">X</a>

            <h2>Create new post</h2>

            <form>
              {inputs}
              <button onClick={this.handleSubmit}>Create</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

class Posts extends React.Component{
  constructor(props) {
    super(props);
    this.handleNavFirst = this.handleNavFirst.bind(this);
    this.handleNavPrev = this.handleNavPrev.bind(this);
    this.handleNavNext = this.handleNavNext.bind(this);
    this.handleNavLast = this.handleNavLast.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(event) {
    event.preventDefault();
    var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
    if (/^[0-9]+$/.test(pageSize)) {
      this.props.updatePageSize(pageSize);
    } else {
      ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
    }
  }

  handleNavFirst(event) {
    event.preventDefault();
    this.props.onNavigate(this.props.links.first.href);
  }

  handleNavPrev(event) {
    event.preventDefault();
    this.props.onNavigate(this.props.links.prev.href);
  }

  handleNavNext(event) {
    event.preventDefault();
    this.props.onNavigate(this.props.links.next.href);
  }

  handleNavLast(event) {
    event.preventDefault();
    this.props.onNavigate(this.props.links.last.href);
  }

  render() {
    const posts = this.props.posts.map(post =>
      <Post key={post._links.self.href} post={post} onDelete={this.props.onDelete}/>
    );

    const navLinks = [];
    if ("first" in this.props.links) {
      navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
    }
    if ("prev" in this.props.links) {
      navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
    }
    if ("next" in this.props.links) {
      navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
    }
    if ("last" in this.props.links) {
      navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
    }

    return (
      <div>
        <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
        <table>
          <tbody>
            <tr>
              <th>Title</th>
              <th>Body</th>
              <th></th>
            </tr>
            {posts}
          </tbody>
        </table>
        <div>
          {navLinks}
        </div>
      </div>
    )
  }
}

class Post extends React.Component{
  constructor(props) {
    console.log("Post - props:", props)
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    this.props.onDelete(this.props.post)
  }

  render() {
    return (
      <tr>
        <td>{this.props.post.title}</td>
        <td>{this.props.post.body}</td>
        <td><button onClick={this.handleDelete}>Delete</button></td>
      </tr>
    )
  }
}

ReactDOM.render( <App />, document.getElementById('react') )
