import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import SideBar from '../../components/PipelineSidebar';
import { useAuthStore } from "../../stores";
import { useHistory } from 'react-router-dom';
import axios from 'axios';


const DeletePipelinePage = () => {
    const history = useHistory();
    const [dropdownData, setDropdownData] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const [showModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [pipelines, setPipelines] = useState([]);

    if (!loggedInStatus) {
        history.push('/login');
    }

    useEffect(() => {
        listPipelinesApi();
    }, []);
    // useEffect(() => {
    //     // listPipelinesApi();
    //     console.log(pipelines)
    // }, [pipelines]);

    const handleDeleteClick = () => {
        if (!selectedPipeline) {
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
        deletePipelineApi();
        setShowModal(false);
    };

    const deletePipelineApi = async () => {
        // console.log(selectedPipeline);
        const url = `${import.meta.env.VITE_API_URL}/api/pipeline/delete_pipeline`;
        try {
            const response = await axios.post(url, {
                pipeline_name: selectedPipeline
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    // 'Session-Token': localStorage.getItem('token')
                }
            });
    
            if (response.status === 200) {
                listPipelinesApi();
                // setPipelines([])
                setSelectedPipeline('');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000);
                alert(response.data.message);
            } else {
                throw new Error(response.data.error || 'Failed to delete pipeline');
            }
        } catch (error) {
            console.error('Delete error:', error.response ? error.response.data : error);
            alert(error.response ? error.response.data.message : 'Delete failed due to an error.');
        }
    };
    
    
    
    
    const listPipelinesApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/pipeline/get_all_pipelines`;
        try {
            const response = await axios.get(url,{},{
                headers: {
                    'Content-Type': 'application/json',
                    // 'Session-Token': localStorage.getItem('token')
                }
            });
            if (response.data.error) {
                alert(response.data.error);
                // setPipelines([]);
                // console.log(pipelines)
            } else {
                setPipelines(response.data.pipeline_list);
            }
        } catch (error) {
            // console.error('Error fetching pipelines:', error);
            // alert('Failed to fetch pipelines');
            // setPipelines([])
            
        }
    };

    
    return (
        <Container className="view-page-container">
            <Row>
                <Col className="col-2">
                    <SideBar />
                </Col>
                <Col className="col-10">
                    <h1 className="text-left">Delete Pipeline Page</h1>
                    <div className="data-selection">
                        <h2>Select a pipeline to delete</h2>
                        <select 
                            className="dataset-select"
                            onChange={(e) => setSelectedPipeline(e.target.value)}
                            value={selectedPipeline}
                        >
                            <option value="">Select a pipeline</option>
                            {pipelines.map((pipeline, index) => (
                                <option key={index} value={pipeline.pipeline_name}>
                                    {pipeline.pipeline_name}
                                </option>
                            ))}
                        </select>
                        <div className="d-flex justify-content-center">
                            <button className='btn btn-danger mt-3' onClick={handleDeleteClick}>Delete a pipeline</button>
                        </div>
                        {showAlert && <Alert variant="warning" className="fadeAlert">No pipeline selected!</Alert>}
                        {showSuccessAlert && <Alert variant="success">The pipeline has been deleted!</Alert>}
                    </div>
                </Col>
            </Row>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Pipeline</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to delete this pipeline permanently?</Modal.Body>
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

export default DeletePipelinePage;
