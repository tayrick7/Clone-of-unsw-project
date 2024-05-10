import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore, usePipelineStore } from "../../stores";
import { Container, Row, Button, Col, Form, Alert } from 'react-bootstrap';
import PipelineSideBar from '../../components/PipelineSidebar';
import axios from 'axios';

const SelectPipelinePage = () => {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const [pipelines, setPipelines] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const targetPipelineName = usePipelineStore((state) => state.setTargetPipelineName);
    const setPipelineInfo = usePipelineStore((state) => state.setPipelineInfo);

    if (!loggedInStatus) {
        history.push('/login');
    }

    useEffect(() => {
        listPipelinesApi();
    }, []);

    const listPipelinesApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/pipeline/get_all_pipelines`;
        try {
            const response = await axios.get(url);
            if (response.data.error) {
                alert(response.data.error);
            } else {
                setPipelines(response.data.pipeline_list);
            }
        } catch (error) {
            console.error('Error fetching pipelines:', error);
            alert('Failed to fetch pipelines');
        }
    };

    const handleCreateButtonClick = () => {
        history.push('/pipeline/create');
    };

    const handleNextButtonClick = async () => {
        if (!selectedPipeline) {
            alert('Please select a pipeline first.');
            return;
        }
        console.log(selectedPipeline)
        const url = `${import.meta.env.VITE_API_URL}/api/pipeline/get_certain_pipeline`;
        const response = await axios.post(url, { pipeline_name: selectedPipeline });
        if (response.status == 200) {
           setPipelineInfo(response.data);
        }

        history.push('/pipeline/results');
    };

    const handlePipelineSelection = (pipelineId) => {
        setSelectedPipeline(pipelineId);
        targetPipelineName(pipelineId);
    };

    return (
        <Container fluid className="select-pipeline-page-container">
            <Row>
                <Col xs={2} id="sidebar-wrapper">
                    <PipelineSideBar />
                </Col>
                <Col xs={10} id="page-content-wrapper">
                    <Row className="justify-content-md-center text-center mt-4">
                        <h1>Select a Pipeline to Run the Model</h1>
                    </Row>
                    <Row className="justify-content-md-center text-center">
                        <p>Existing pipelines for selected dataset:</p>
                    </Row>
                    <Row className="justify-content-md-center text-center">
                        <Col md="auto">
                            <Form.Control as="select" 
                                value={selectedPipeline} 
                                onChange={(e) => handlePipelineSelection(e.target.value)}
                                className="mb-3"
                            >
                                <option value="">Select a pipeline</option>
                                {pipelines.map((pipeline, index) => (
                                    <option key={index} value={pipeline.pipeline_name}>
                                        {pipeline.pipeline_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col md="auto">
                            <Button onClick={handleCreateButtonClick} className="me-2">
                                Create new pipeline
                            </Button>
                            <Button onClick={handleNextButtonClick}>
                                Next
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default SelectPipelinePage;
