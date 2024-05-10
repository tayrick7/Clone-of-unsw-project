import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../../stores";
import { Container, Row, Button, Col, Form, Alert, FormGroup, FormCheck } from 'react-bootstrap';
import PipelineSideBar from '../../components/PipelineSidebar';
import axios from 'axios';

const CreatePipelinePage = () => {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const [pipelineLabel, setPipelineLabel] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [models, setModels] = useState([{ model_id: '1', model_name: 'Model A' },{ model_id: '2', model_name: 'Model B' }]);
    // const [preprocessingMethods, setPreprocessingMethods] = useState([]);
    // const [selectedPreprocessingMethods, setSelectedPreprocessingMethods] = useState([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    if (!loggedInStatus) {
        history.push('/login');
    }

    const [preprocessingMethods, setPreprocessingMethods] = useState([
        { name: 'Drop duplicate', checked: false },
        { name: 'PCA', checked: false },
        { name: 'Fill NA', checked: false }
    ]);
    const [selectedPreprocessingMethods, setSelectedPreprocessingMethods] = useState({});

    useEffect(() => {
        listModelsApi();
        // fetchPreprocessingMethods();
    }, []);

    const listModelsApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/model/get_all_models`;
        try {
            const response = await axios.get(url);
            setModels(response.data.model_list);
        } catch (error) {
            alert('Failed to fetch models');
        }
    };

    // const fetchPreprocessingMethods = async () => {
    //     const url = `${import.meta.env.VITE_API_URL}/api/preprocessing/get_methods`;
    //     try {
    //         const response = await axios.get(url);
    //         setPreprocessingMethods(response.data.methods);
    //     } catch (error) {
    //         alert('Failed to fetch preprocessing methods');
    //     }
    // };

    const handlePreprocessingChange = (method) => {
        setSelectedPreprocessingMethods(prev => ({
            ...prev,
            [method]: !prev[method]
        }));
    };

    const CreatePipelineApi = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/pipeline/create_pipeline`;
        try {
            const response = await axios.post(url, {
                pipeline_name: pipelineLabel,
                model_name: selectedModel,
                items: [
                    {
                      "label": "drop_duplicate",
                      "checked": true
                    },
                    {
                      "label": "pca",
                      "checked": false
                    },
                    {
                      "label": "fill_na",
                      "checked": true
                    }
                  ]
            }, {headers: {
                'Content-Type': 'application/json',
                'Session-Token': localStorage.getItem('token')
            }});
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 3000);
            localStorage.setItem('pipeline_name', pipelineLabel)
            localStorage.setItem('model_name',selectedModel)
            console.log(pipelineLabel)
            console.log(selectedModel)
        } catch (error) {
            alert('Failed to create pipeline');
        }
    };

    const handleSaveButtonClick = async () => {
        CreatePipelineApi();
    };

    const handleNextButtonClick = () => {
        history.push('/pipeline/select');
    };

    return (
        <>
            <style type="text/css">
            {`
                .label-bold {
                    font-size: 1.2rem;
                    font-weight: bold;
                }
            `}
            </style>
            <Container fluid className="create-pipeline-page-container">
                <Row>
                    <Col md={2} className="sidebar">
                        <PipelineSideBar />
                    </Col>
                    <Col md={10}>
                        <h1>Create Pipeline</h1>
                        <FormGroup className="mb-3">
                            <Form.Label className="label-bold">Pipeline Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter pipeline label"
                                value={pipelineLabel}
                                onChange={(e) => setPipelineLabel(e.target.value)} 
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Form.Label className="label-bold">Data Pre-processing</Form.Label>
                        {preprocessingMethods.map((method, index) => (
                            <FormCheck
                                key={index}
                                type="checkbox"
                                label={method.name}
                                checked={selectedPreprocessingMethods[method.name] || false}
                                onChange={() => handlePreprocessingChange(method.name)}
                            />
                        ))}
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Form.Label className="label-bold">Model</Form.Label>
                            <Form.Control as="select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                                <option value="">Select a model</option>
                            {models.map((model, index) => (
                                <option key={index} value={model.model_name}>
                                    {model.model_name}
                                </option>
                            ))}
                            </Form.Control>
                        </FormGroup>
                        <Row className="mt-3">
                            <Col>
                                {showSuccessAlert && (
                                    <Alert variant="success">
                                        Save successfully!
                                    </Alert>
                                )}
                            </Col>
                        </Row>
                        <Row className="mt-3 justify-content-md-center">
                            <Col md="auto">
                                <Button onClick={handleSaveButtonClick} className="me-2">Save</Button>
                                <Button onClick={handleNextButtonClick}>Next</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default CreatePipelinePage;
