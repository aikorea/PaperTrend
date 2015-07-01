var PaperApp = React.createClass({
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
        this.chart.Line(this.dataToChart(), {'responsive':true}) ;
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  dataToChart: function() {
    //var labels = _.uniq(_.pluck(this.state.data, 'year'));
    var hist = _.chain(this.state.data).countBy("year").value();
    chartData = {
      labels: _.keys(hist),
      datasets: [
        {
          label : "PaperTrend",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: _.values(hist),
        }
      ]
    };
    //this.setState({chartData: chartData});
    console.log(chartData);
    return chartData;
  },
  componentDidMount: function() {
    this.ctx = document.getElementById("chart").getContext("2d");
    this.chart = new Chart(this.ctx);

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
        this.chart.Line(this.dataToChart(), {'responsive':true}) ;
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
            <canvas id="chart" width="100%" height="20"></canvas>
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
      <div className="row">
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
        <Paper title={paper.title} year={paper.year} key={index}>
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
    return (
      <li className="paper"><h2>{this.props.title}</h2>{this.props.year}</li>
    );
  }
});

React.render(
  <PaperApp url="papers.json" />,
  document.getElementById('content')
);
