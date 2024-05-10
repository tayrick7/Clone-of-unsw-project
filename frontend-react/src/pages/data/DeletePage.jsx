import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import SideBar from '../../components/Sidebar';
import axios from 'axios';

const DeletePage = () => {
    const [dropdownData, setDropdownData] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [email,setEmail] = useState(localStorage.getItem('email'));

    useEffect(() => {
        listDatasetsApi();
    }, []);

    const handleDeleteClick = () => {
        if (!selectedDataset) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            return;
        }
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleConfirmDelete = () => {
        DeleteDatasetsApi();
        setShowModal(false);
    };

    const DeleteDatasetsApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/delete_dataset`;
        try {
            const response = await axios.post(url, {
                tablename: selectedDataset
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': localStorage.getItem('token')
                }
            });
            if (response.status === 200) { // Assuming 200 means success
                listDatasetsApi();
                setSelectedDataset('');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000);
            } else {
                throw new Error('Failed to delete dataset');
            }
        } catch (error) {
            console.error('Delete error:', error.response ? error.response.data : error);
            alert(error.response ? error.response.data.message : 'Delete failed due to an error.');
        }
    };
    


    const listDatasetsApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/list_user_datasets`;
    
        try {
            const response = await axios.post(url, { email }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Session-Token': localStorage.getItem('token')  // Add the session token from local storage
                },
                // body: JSON.stringify({
                //     SessionToken,
                //   }),
            });
    
            if (response.data.error) {
                // If there's an error returned by the server, alert it
                alert(response.data.error);
            } else {
                // Assuming response.data.tables contains the array of tables to be set for dropdown
                console.log(response.data.tables);  // Logging the tables to console
                setDropdownData(response.data.tables);  // Update state with tables data
            }
        } catch (error) {
            console.error('Error fetching dataset list:', error);
            let errorMessage = 'Failed to load datasets due to an error';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage += ': ' + error.response.data.message;
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            } else if (typeof error === 'string') {
                errorMessage += ': ' + error;
            }
            alert(errorMessage);
        }
        
        
    };
    
    

    return (
        <Container className="view-page-container">
            <Row>
                <Col className="col-2">
                    <SideBar />
                </Col>
                <Col className="col-10">
                    <h1 className="text-left">Delete Dataset</h1>
                    <div className="data-selection">
                        <h2>Select a dataset to delete</h2>
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
                        <div className="d-flex justify-content-center">
                            <button className='btn btn-danger mt-3' onClick={handleDeleteClick}>Delete a file</button>
                        </div>
                        {showAlert && <Alert variant="warning" className="fadeAlert">No dataset selected!</Alert>}
                        {showSuccessAlert && <Alert variant="success">The dataset has been deleted!</Alert>}
                    </div>
                </Col>
            </Row>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Dataset</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to delete this dataset permanently?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        No
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default DeletePage;