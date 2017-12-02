import React, { Component } from 'react';
import { PanelGroup, Panel, Row, Col, Button } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import StateStore from '../lib/StateStore';
import BrowsePlaylist from './BrowsePlaylist';
import ManageStream from './ManageStream';
import ElementPathIcon from './ElementPathIcon';

class Dashboard extends Component {	
  constructor(props) {
    super(props);
		
		this.state = {
			streamList: StateStore.getState().streamList,
			playlist: StateStore.getState().playlist,
			recent: [],
			recentLoaded: false,
			random: [],
			randomLoaded: false
		};
		
		this.loadRecent = this.loadRecent.bind(this);
		this.loadRandom = this.loadRandom.bind(this);
		
		this.loadRecent();
		this.loadRandom();
	}
	
	componentWillReceiveProps(nextProps) {
		this.setState({
			streamList: [],
			playlist: [],
			recent: [],
			recentLoaded: false,
			random: [],
			randomLoaded: false
    }, () => {
			this.loadRecent();
			this.loadRandom();
		});
	}
	
	componentDidMount() {
		this._ismounted = true;
	}

	componentWillUnmount() {
		this._ismounted = false;
	}
	
	loadRecent() {
		if (this._ismounted) {
			this.setState({recent: [], recentLoaded: false}, () => {
				StateStore.getState().APIManager.taliesinApiRequest("PUT", "/search/", {sort: "last_updated", sort_direction: "desc"})
				.then((result) => {
					var list = [], listComponents = [];
					result.forEach((element, index) => {
						var pathParent = element.path.substring(0, element.path.lastIndexOf("/"));
						var path = pathParent.substring(0, pathParent.lastIndexOf("/"));
						var name = pathParent.substring(pathParent.lastIndexOf("/") + 1);
						if (!list.find((elt) => {
							return elt.pathParent === pathParent && elt.data_source === element.data_source;
						})) {
							var newElt = {data_source: element.data_source, type: "folder", path: path, name: name, pathParent: pathParent};
							list.push(newElt);
							listComponents.push(<ElementPathIcon key={index} dataSource={element.data_source} path={path} element={newElt} className="dashboard-list" />);
						}
					});
					this.setState({recent: listComponents, recentLoaded: true});
				})
				.fail((result) => {
					this.setState({recent: [], recentLoaded: true});
				});
			});
		}
	}
	
	loadRandom() {
		if (this._ismounted) {
			this.setState({random: [], randomLoaded: false}, () => {
				StateStore.getState().APIManager.taliesinApiRequest("PUT", "/search/", {sort: "random", limit: 10})
				.then((result) => {
					var list = [], listComponents = [];
					result.forEach((element, index) => {
						var pathParent = element.path.substring(0, element.path.lastIndexOf("/"));
						var path = pathParent.substring(0, pathParent.lastIndexOf("/"));
						var name = pathParent.substring(pathParent.lastIndexOf("/") + 1);
						if (!list.find((elt) => {
							return elt.pathParent === pathParent && elt.data_source === element.data_source;
						})) {
							var newElt = {data_source: element.data_source, type: "folder", path: path, name: name, pathParent: pathParent};
							list.push(newElt);
							listComponents.push(<ElementPathIcon key={index} dataSource={element.data_source} path={path} element={newElt} className="dashboard-list" />);
						}
					});
					this.setState({random: listComponents, randomLoaded: true});
				})
				.fail((result) => {
					this.setState({random: [], randomLoaded: true});
				});
			});
		}
	}
  
  render() {
		var recentLoading, randomLoading;
		if (!this.state.recentLoaded) {
			recentLoading = <FontAwesome name="spinner" spin />;
		}
		if (!this.state.randomLoaded) {
			randomLoading = <FontAwesome name="spinner" spin />;
		}
		return (
			<div>
				<h2>Taliesin Streaming server</h2>
				<PanelGroup>
					<Panel collapsible header="Streams" eventKey="1" defaultExpanded={true}>
						<ManageStream />
					</Panel>
					<Panel collapsible header="Playlists" eventKey="2">
						<BrowsePlaylist />
					</Panel>
					<Panel collapsible header="Albums recently added" eventKey="3">
						<Row>
							<Col md={2} sm={2} xs={2}>
								<Button title="Refresh" onClick={this.loadRecent}>
									<FontAwesome name={"refresh"} />
								</Button>
							</Col>
						</Row>
						{recentLoading}
						<Row>
							{this.state.recent}
						</Row>
					</Panel>
					<Panel collapsible header="Random albums" eventKey="4">
						<Row>
							<Col md={2} sm={2} xs={2}>
								<Button title="Refresh" onClick={this.loadRandom}>
									<FontAwesome name={"refresh"} />
								</Button>
							</Col>
						</Row>
						{randomLoading}
						<Row>
							{this.state.random}
						</Row>
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default Dashboard;
