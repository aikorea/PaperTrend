var PaperApp = React.createClass({
  getInitialState: function() {
    return {data: [], title: ""};
  },
  loadPaperFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data['papers']});
        this.updateChart();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.yearCtx = document.getElementById("year-chart").getContext("2d");
    this.yearChart = new Chart(this.yearCtx);

    this.authorCtx = document.getElementById("author-chart").getContext("2d");
    this.authorChart = new Chart(this.authorCtx);

    this.loadPaperFromServer();
  },
  updateChart: function() {
    if (typeof this.yearLineChart !== 'undefined') {
      this.yearLineChart.destroy();
      this.authorLineChart.destroy();
    }

    var chartData = this.dataToChart();
    this.yearLineChart = this.yearChart.Line(chartData[0], {'responsive':true}) ;
    this.authorLineChart = this.authorChart.Line(chartData[1], {'responsive': true, 'scaleShowLabels': false}) ;
  },
  dataToChart: function() {
    //var labels = _.uniq(_.pluck(this.state.data, 'year'));
    var yearHist = _.chain(this.state.data).countBy("year").value();
    var authorHist = _.chain(this.state.data)
      .map(function(item) { return item.authors; })
      .flatten()
      .reduce(function(counts, word) {
        counts[word] = (counts[word] || 0) + 1;
        return counts;
      }, {})
      .value();

    yearChartData = {
      labels: _.keys(yearHist),
      datasets: [
        {
          label : "Paper Trend",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: _.values(yearHist),
        }
      ]
    };

    var authorKeys = _.keys(authorHist);
    var authorValues = _.values(authorHist);

    authorKeys = authorValues.map(function(e,i){return i;})
      .sort(function(a,b){return authorValues[b] - authorValues[a];})
      .map(function(e){return authorKeys[e];});

    authorValues.sort(function(a, b){return b-a});

    authorChartData = {
      labels: authorKeys.slice(0, 20),
      datasets: [
        {
          label : "Author Trend",
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: authorValues.slice(0, 20),
        }
      ]
    };

    return [yearChartData, authorChartData];
  },
  makeTitle: function(data) {
    title = "Results ";

    if (data['query'])
      title += 'of "' + data['query'] + '"';
    if (data['year'])
      title += "at " + data['year'];

    return title
  },
  handlePaperSubmit: function(paper) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: paper,
      success: function(data) {
        this.setState({data: data['papers']});
        this.setState({title: this.makeTitle(data)});
        this.updateChart();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="container">
        <PaperSearchForm onPaperSubmit={this.handlePaperSubmit} />
        <div className="row">
          <div className="col s12">
            <h4 className="center-align">{this.state.title}</h4>
          </div>
          <div className="col s12">
            <canvas id="year-chart" width="100%" height="20"></canvas>
          </div>
          <div className="col s12">
            <canvas id="author-chart" width="100%" height="40"></canvas>
          </div>
        </div>
        <PaperList data={this.state.data} />
      </div>
    );
  }
});

var PaperSearchForm = React.createClass({
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
      <div className="row search-form">
        <form className="col m6 s12 offset-m3" onSubmit={this.handleSubmit}>
          <div className="row">
            <div className="input-field col s6">
              <input id="query" type="text" ref="query" className="validate" />
              <label>Query</label>
            </div>
            <div className="input-field col s6">
              <input id="year" type="text" ref="year" className="validate" />
              <label>Year</label>
            </div>
          </div>
        </form>
      </div>
    );
  }
});

var PaperList = React.createClass({
  render: function() {
    var paperNodes = this.props.data.map(function(paper, index) {
      return (
        <Paper title={paper.title} year={paper.year} authors={paper.authors} key={index}>
        </Paper>
      );
    });
    return (
      <div className="row">
        <ul className="paperList">
          {paperNodes}
        </ul>
      </div>
    );
  }
});

var Paper = React.createClass({
  render: function() {
    var authorNodes = this.props.authors.map(function(author, index) {
      return (
        <li className="author">{author}</li>
      );
    });
    return (
      <li className="paper">
        <h3>{this.props.title}</h3>
        <ul>
          {authorNodes}
        </ul>
        {this.props.year}
      </li>
    );
  }
});

React.render(
  <PaperApp url="papers.json" />,
  document.getElementById('content')
);
