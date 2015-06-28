(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var PaperApp = React.createClass({displayName: "PaperApp",
  getInitialState: function() {
    return {data: []};
  },
  loadPaperFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['papers']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadPaperFromServer();
  },
  handlePaperSubmit: function(paper) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: paper,
      success: function(data) {
        this.setState({data: data['papers']});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      React.createElement("div", {className: "container"}, 
        React.createElement(PaperSearchForm, {onPaperSubmit: this.handlePaperSubmit}), 
        React.createElement(PaperList, {data: this.state.data})
      )
    );
  }
});

var PaperSearchForm = React.createClass({displayName: "PaperSearchForm",
  handleSubmit: function(e) {
    e.preventDefault();
    var query = React.findDOMNode(this.refs.query).value.trim();
    var year = React.findDOMNode(this.refs.year).value.trim();
    /*if (!query || !year) {
      return;
    }*/
    this.props.onPaperSubmit({query: query, year: year});
    React.findDOMNode(this.refs.query).value = '';
    React.findDOMNode(this.refs.year).value = '';
    return;
  },
  handleKeyDown: function(event) {
    if (event.keyCode == 13 /*enter*/) {
      this.handleSubmit(event);
    }
  },
  componentDidMount: function() {
    $(document.body).on('keydown', this.handleKeyDown);
  },

  componentWillUnMount: function() {
    $(document.body).off('keydown', this.handleKeyDown);
  },
  render: function() {
    return (
      React.createElement("div", {className: "row"}, 
        React.createElement("form", {className: "col m6 s12 offset-m3", onSubmit: this.handleSubmit}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "input-field col s6"}, 
              React.createElement("input", {id: "query", type: "text", ref: "query", className: "validate"}), 
              React.createElement("label", null, "Query")
            ), 
            React.createElement("div", {className: "input-field col s6"}, 
              React.createElement("input", {id: "year", type: "text", ref: "year", className: "validate"}), 
              React.createElement("label", null, "Year")
            )
          )
        )
      )
    );
  }
});

var PaperList = React.createClass({displayName: "PaperList",
  render: function() {
    var paperNodes = this.props.data.map(function(paper, index) {
      return (
        React.createElement(Paper, {title: paper.title, year: paper.year, key: index}
        )
      );
    });
    return (
      React.createElement("div", {className: "row"}, 
        React.createElement("ul", {className: "paperList"}, 
          paperNodes
        )
      )
    );
  }
});

var Paper = React.createClass({displayName: "Paper",
  render: function() {
    return (
      React.createElement("li", {className: "paper"}, React.createElement("h2", null, this.props.title), this.props.year)
    );
  }
});

React.render(
  React.createElement(PaperApp, {url: "papers.json"}),
  document.getElementById('content')
);


},{}]},{},[1])