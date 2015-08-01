yearChart = null, authorChart = null;

var PaperApp = React.createClass({
  getInitialState: function() {
    //var conferences = ['NIPS', 'JMLR', 'CVPR'];
    var conferences = ['ML', 'CV'];
    var includingFilters = {};
    for (var i in conferences) {
      includingFilters[conferences[i]] = true;
    }
    return {
      data: [],
      filteredData: [],
      title: "",
      authorLimit: 20, 
      page: 0,
      showList: false,
      showAll: false,
      conferences: conferences,
      includingFilters: includingFilters,
    };
  },
  dataRequestFromServer: function(page) {
    $.ajax({
      url: this.props.url,
      method: 'POST',
      data: {'page' : this.state.page},
      dataType: 'json',
      cache: false,
      success: function(data) {
        var newData = this.state.data.concat(data['papers']);
        this.setState({
          data: newData,
          filteredData: newData,
          page: this.state.page + 1
        });
        console.log(this.state.page);
        if (!data['end']) {
          setTimeout(this.dataRequestFromServer, 400, this.state.page);
        } else {
          this.setState({showList: true});
          this.updateChart();

          dynamicAspectRatio = this.dynamicAspectRatio;
          $(window).resize(function(){
            dynamicAspectRatio(true);
          });
          dynamicAspectRatio(true);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadPaperFromServer: function() {
    this.dataRequestFromServer(0);
  },
  dynamicAspectRatio: function(update) {
    var width = $(window).width();

    if (width <= 468) {
      yearChart.chart.aspectRatio = 2.5;
      authorChart.chart.aspectRatio = 1.5;
      this.setState({authorLimit:7});
    } else if (width <= 600) {
      yearChart.chart.aspectRatio = 3;
      authorChart.chart.aspectRatio = 2;
      this.setState({authorLimit:12});
    } else if (width <= 992) {
      yearChart.chart.aspectRatio = 3.5;
      authorChart.chart.aspectRatio = 2;
      this.setState({authorLimit:17});
    } else {
      yearChart.chart.aspectRatio = 4;
      authorChart.chart.aspectRatio = 2.5;
      this.setState({authorLimit:20});
    }
    console.log("~~~~~~~~~~~",yearChart.chart.aspectRatio);
    if (update) {
      this.updateChart();
    }
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
    this.yearLineChart = this.yearChart.Line(chartData[0], {'responsive':true});
    this.authorLineChart = this.authorChart.Line(chartData[1], {'responsive': true, 'scaleShowLabels': false});

    yearChart = this.yearLineChart, authorChart = this.authorLineChart;
  },
  dataToChart: function() {
    //var labels = _.uniq(_.pluck(this.state.data, 'year'));
    var yearHist = _.chain(this.state.filteredData).countBy("year").value();
    var authorHist = _.chain(this.state.filteredData)
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
      labels: authorKeys.slice(0, this.state.authorLimit),
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
  getTitle: function(options) {
    var title = "Results ", query = options['query'], year = options['year'];

    if (query)
      title += 'of "' + query + '"';
    if (year)
      title += "at " + year;

    return title;
  },
  handlePaperSubmit: function(options) {
    var query = options['query'],
        year = options['year'],
        conference = options['conference'],
        filteredData = this.state.data,
        includingFilters = this.state.includingFilters;

    if (conference) {
      var name = conference[0], disabled = conference[1];

      includingFilters[name] = disabled;
      this.setState({includingFilters: includingFilters});
    }

    for (var i in this.state.conferences) {
      var conf = this.state.conferences[i];

      filteredData = _.filter(filteredData, function(item) {
        //if (item['conf'] == conf && !includingFilters[conf])
        if (item['conf'] == 'CVPR' && !includingFilters['CV'])
          return false;
        else if (item['conf'] == 'NIPS' && !includingFilters['ML'])
          return false;
        else if (item['conf'] == 'JMLR' && !includingFilters['ML'])
          return false;
        else
          return true;
      });
    }

    if (query || year) {
      this.setState({
        showList: false,
        showAll: false,
        title: this.getTitle(options),
      });
      filteredData = _.filter(filteredData, function(item) {
        if (query != "" && year != "") {
          return item['title'].toLowerCase().indexOf(query) != -1 && query != "" && item['year'] == year && year != "";
        } else {
          return item['title'].toLowerCase().indexOf(query) != -1 && query != "" || item['year'] == year && year != "";
        }
      });
    }

    this.setState({
      filteredData: filteredData,
      showList: true
    }, this.updateChart);
  },
  changeShowAll: function() {
    var me = this;

    this.setState({
      showList: false
      }, function() {
        setTimeout(function() {
          me.setState({
            showAll: !me.state.showAll
          }, function() {
            me.setState({showList: true});
          });
        }, 400);
      }
    );
  },
  render: function() {
    return (
      <div className="container">
        <PaperSearchForm conferences={this.state.conferences} onPaperSubmit={this.handlePaperSubmit} />
        <div className="row">
          <div className="col s12">
            <h4 className="center-align">{this.state.title}</h4>
          </div>
          <div id="chart-container" className="col s12">
            <canvas id="year-chart" width="100%" height="20"></canvas>
            <canvas id="author-chart" width="100%" height="40"></canvas>
          </div>
        </div>
        { this.state.showList ? <PaperList conferences={this.state.conferences} showAll={this.state.showAll} data={this.state.filteredData} onChangeShowAll={this.changeShowAll} /> : null }
        { !this.state.showList ? <PaperListPreloader /> : null }
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
    $.ajax({
      url: "query.json",
      method: 'GET',
      data: {'query' : query, 'year' : year},
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });

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
  handleFilterOnClick: function(options) {
    this.props.onPaperSubmit(options);
  },
  render: function() {
    var conferences = this.props.conferences,
        divClassName = "center-align col s" + 12 / conferences.length,
        handleFilterOnClick = this.handleFilterOnClick;

    var FilterBtns = conferences.map(function(conference, index) {
      return (
        <div className={divClassName}>
          <FilterBtn onFilterOnClick={handleFilterOnClick} name={conference}/>
        </div>
      );
    });
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
          <div className="row">
            {FilterBtns}
          </div>
        </form>
      </div>
    );
  }
});

var FilterBtn = React.createClass({
  getInitialState() { return {disabled: false} },
  filterConf: function(e) {
    this.setState({disabled: !this.state.disabled});
    this.props.onFilterOnClick({'conference': [this.props.name, this.state.disabled]});
  },
  render: function() {
    /*var nips = false, jmlr = false, cvpr = false;
    if (this.props.name == 'NIPS')
      nips = true;
    else if (this.props.name == 'CVPR')
      cvpr = true;
    else if (this.props.name == 'JMLR')
      jmlr = true;*/
    var ml = false, cv = false, year = false;
    if (this.props.name == 'CV')
      cv = true;
    else if (this.props.name == 'ML')
      ml = true;
    else 
      year = true;
      
    var classes = classNames({
      'waves-light btn': true,
      /*'green': cvpr,
      'blue': nips,
      'orange': jmlr,*/
      'green': cv,
      'blue': ml,
      'cyan': year,
      'disabled': this.state.disabled,
    });

    return (
      <a id={this.props.name} className={classes} onClick={this.filterConf}>{this.props.name}</a>
    );
  }
});

var PaperListPreloader = React.createClass({
  render: function() {
    return (
      <div className="row center-align">
        <div className="preloader-wrapper big active">
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div><div className="gap-patch">
              <div className="circle"></div>
            </div><div className="circle-clipper right">
              <div className="circle"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var PaperList = React.createClass({
  onChangeShowAll: function() {
    this.props.onChangeShowAll();
  },
  render: function() {
    var data = this.props.data,
        isShowAll = data.length > 100;
    if (!this.props.showAll) {
      data = data.slice(0, 100);
    }
    var paperNodes = data.map(function(paper, index) {
      return (
        <Paper conference={paper.conf} title={paper.title} year={paper.year} authors={paper.authors} pdf={paper.pdf} key={index}>
        </Paper>
      );
    });
    return (
      <div className="row">
        <div className="center-align">
          { !this.props.showAll && isShowAll ? <a className="waves-effect waves-light btn-large teal" onClick={this.onChangeShowAll}>show all</a> : null }
        </div>
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
        <h3><a href={this.props.pdf}>{this.props.title}</a></h3>
        <ul>
          {authorNodes}
        </ul>
        <Tag name={this.props.conference} />
        <Tag name={this.props.year} />
      </li>
    );
  }
});

var Tag = React.createClass({
  render: function() {
    var nips = false, jmlr = false, cvpr = false, year = false;
    if (this.props.name == 'NIPS')
      nips = true;
    else if (this.props.name == 'CVPR')
      cvpr = true;
    else if (this.props.name == 'JMLR')
      jmlr = true;
    else 
      year = true;
      
    var classes = classNames({
      'tag waves-light btn btn-small': true,
      'green': cvpr,
      'blue': nips,
      'orange': jmlr,
      'cyan': year,
    });
    return (
      <div className={classes}>{this.props.name}</div>
    );
  }
});

React.render(
  <PaperApp url="papers.json" />,
  document.getElementById('content')
);
