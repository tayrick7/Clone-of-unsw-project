import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../../stores";
import { Container, Row, Col, Table } from 'react-bootstrap';
import SideBar from '../../components/Sidebar';
import axios from 'axios';

const ViewPage = () => {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const [dropdownData, setDropdownData] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState('');
    const [datasets, setDatasets] = useState([]);
    const [columnNames,setColumnNames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    

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
        <Container className="view-page-container">
            <Row>
                <Col className="col-2">
                    <SideBar />
                </Col>
                <Col className="col-10">
                    <h1>Dataset Preview</h1>
                    <div className="data-selection">
                        <h2>Select a dataset to preview</h2>
                        <div className="dropdown-bar">
                            <select 
                                className="dataset-select"
                                onChange={(e) => setSelectedDataset(e.target.value)}
                                value={selectedDataset}
                            >
                                <option value="">Select a dataset</option>
                                {dropdownData.map((item, index) => (
                                    <option key={index} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {isLoading ? (
                            <div className="loading-container">
                                <img src="/public/loading.gif" alt="Loading" className="loading-gif" />
                            </div>
                        ) : (
                            <div className="scrollable-table">
                                {selectedDataset ? (
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                {columnNames.map((name, index) => (
                                                    <th key={index}>{name}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {datasets.map((item, index) => (
                                                <tr key={index}>
                                                    {columnNames.map((colName) => (
                                                        <td key={colName}>{item[colName]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="mt-3">Select a dataset to preview.</div>
                                )}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default ViewPage;
