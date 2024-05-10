import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore, usePipelineStore } from "../../stores";
import { Container, Row, Button, Col, Table, Alert, Form } from 'react-bootstrap';
import PipelineSideBar from '../../components/PipelineSidebar';
import axios from 'axios';


const PipelineResultsPage = () => {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const pipelineInfo = usePipelineStore((state) => state.pipelineInfo);
    const [checkedItems, setCheckedItems] = useState(new Set());
    const [dropdownData, setDropdownData] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState('');
    const [columnNames,setColumnNames] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [anomalyLog, setAnomalyLog] = useState([]);


    useEffect(() => {
        if (loggedInStatus) {
            listDatasetsApi();
        } else {
            history.push('/login');
        }
    }, [loggedInStatus]);

    useEffect(() => {
        if (selectedDataset) {
            listADatasetApi();
        }
    }, [selectedDataset]);

    function handleCheckboxChange(event, item) {
        const newCheckedItems = new Set(checkedItems);
        if (event.target.checked) {
            newCheckedItems.add(item.id);
        } else {
            newCheckedItems.delete(item.id);
        }
        setCheckedItems(newCheckedItems);
    }

    function getCheckedIds() {
        return Array.from(checkedItems);
    }

    const listDatasetsApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/list_user_datasets`;
        try {
            const response = await axios.post(url, { email: localStorage.getItem('email') }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': localStorage.getItem('token')
                }
            });

            if (response.data.error) {
                alert(response.data.error);
            } else {
                setDropdownData(response.data.tables);
            }
        } catch (error) {
            console.error('Error fetching dataset list:', error);
            alert('Failed to load datasets due to an error: ' + (error.response ? error.response.data.message : error.message));
        }
    };

    const listADatasetApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/get_user_dataset_data`;
        setIsLoading(true);
        try {
            const response = await axios.post(url, { tablename: selectedDataset }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': localStorage.getItem('token')
                }
            });

            if (response.data.error) {
                alert(response.data.error);
            } else {
                setDatasets(response.data.dataset);
                if (response.data.dataset.length > 0) {
                    const firstItem = response.data.dataset[0];
                    const columnNames = Object.keys(firstItem);
                    setColumnNames(columnNames);
                }
            }
        } catch (error) {
            console.error('Error fetching dataset:', error);
            alert('Failed to load datasets due to an error: ' + (error.response ? error.response.data.message : error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
<Container fluid>
    <Row className="justify-content-center">
        <Col xs={12} className="text-center mb-4">
            <h1>Anomaly Result</h1>
        </Col>
    </Row>
    <Row>
        <Col xs={2} id="sidebar-wrapper">
            <PipelineSideBar />
        </Col>
        <Col xs={10} id="page-content-wrapper">
            <Col md={12} style={{
                background: '#FFFFFF', 
                width: '80%',
                borderRadius: '10px', 
                marginBottom: '50px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <Form>
                    {/* <Form.Group controlId="formDataset">
                        <Form.Label>Dataset</Form.Label>
                        <Form.Control type="text" placeholder="Sample" defaultValue={selectedDataset} style={{width: '100%'}} />
                    </Form.Group> */}
                    <Form.Group controlId="formPipelineName">
                        <Form.Label>Pipeline</Form.Label>
                        <Form.Control type="text" placeholder="Sample" defaultValue={pipelineInfo.pipeline_name} readOnly style={{width: '100%', userSelect: 'none',pointerEvents: 'none'}} />
                    </Form.Group>
                    <Form.Group controlId="formPreprocessing">
                        <Form.Label>Preprocessing</Form.Label>
                        <Form.Control type="text" placeholder="Sample" defaultValue={pipelineInfo.preprocessing} readOnly style={{width: '100%', userSelect: 'none',pointerEvents: 'none'}} />
                    </Form.Group>
                    <Form.Group controlId="formModel">
                        <Form.Label>Model</Form.Label>
                        <Form.Control type="text" placeholder="Sample" defaultValue={pipelineInfo.model_name} readOnly style={{width: '100%', userSelect: 'none',pointerEvents: 'none'}} />
                    </Form.Group>
                </Form>
            </Col>

            <Col md={12} style={{
                background: '#f8f9fa', 
                width: '80%',
                borderRadius: '10px', 
                marginBottom: '20px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <h2 style={{fontSize: '16px'}}>Dataset</h2>
                <div className="data-selection">
                    <h2 style={{fontSize: '16px'}}>Select a dataset to view this pipeline's anomalies</h2>
                    <div className="dropdown-bar">
                        <select 
                            className="dataset-select"
                            onChange={(e) => setSelectedDataset(e.target.value)}
                            value={selectedDataset}
                        >
                            <option value="">Select a dataset</option>
                            {dropdownData.map((item, index) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                    {isLoading ? (
                        <div className="loading-container">
                            <img src="/public/loading.gif" alt="Loading" className="loading-gif" />
                        </div>
                    ) : selectedDataset ? (
                        <div className="scrollable-table">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        {/* <th>Selected</th> */}
                                        {columnNames.map((name, index) => (
                                            <th key={index}>{name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets.map((item, index) => (
                                        <tr key={index}>
                                            {/* <td>
                                                <input 
                                                    type="checkbox"
                                                    onChange={(e) => handleCheckboxChange(e, item)}
                                                    checked={checkedItems.has(item.id)}
                                                />
                                            </td> */}
                                            {columnNames.map((colName) => (
                                                <td key={colName}>{item[colName]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        // <div className="mt-3">Select a dataset to reject row</div>
                        <div></div>
                    )}
                </div>
            </Col>
            {/* <Row className="justify-content-center">
                <Col md={12} className="text-center">
                    <Button variant="danger" onClick={() => console.log(getCheckedIds())} style={{
                        marginRight: '50px'
                    }}>Reject</Button>
                    <Button variant="success" onClick={() => history.push('/')} style={{
                        marginRight: '250px'
                    }}>Save</Button>
                </Col>
            </Row> */}
        </Col>
    </Row>
</Container>
    );
    
}

export default PipelineResultsPage;
