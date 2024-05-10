/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';

import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { useAuthStore, usePipelineStore, useAnomalyStore } from "../stores";

function BuildPipelinePage() {
    const history = useHistory();
    const email = useAuthStore((state) => state.email);
    const setModelName = usePipelineStore((state) => state.setModelName);
    const setModelVersion = usePipelineStore((state) => state.setModelVersion);
    const setStoredTablename = usePipelineStore((state) => state.setStoredTablename);
    const setInputThreshold = usePipelineStore((state) => state.setInputThreshold);
    const modelName = usePipelineStore((state) => state.model_name);
    const modelVersion = usePipelineStore((state) => state.model_version);
    const storedTablename = usePipelineStore((state) => state.stored_tablename);
    const inputThreshold = usePipelineStore((state) => state.input_threshold);
    const setAnomalyLogId = useAnomalyStore((state) => state.setAnomalyLogId);
    const setAnomalyLogResults = useAnomalyStore((state) => state.setAnomalyLogResults);
    const setFullDataSet = useAnomalyStore((state) => state.setFullDataSet);
    const fullDataSet = useAnomalyStore((state) => state.fullDataSet);
    const anomalyIds = useAnomalyStore((state) => state.anomalyIds);
    const setAnomalyIds = useAnomalyStore((state) => state.setAnomaliesIds);
    const setAnomalies = useAnomalyStore((state) => state.setAnomalies);

    const [selectedDataset, setSelectedDataset] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [datasetDropdown, setDatasetDropdown] = useState([]);
    const [modelDropdown, setModelDropdown] = useState([]);

    useEffect(() => {
        if (!email) {
            history.push('/login');
        } else {
            if (import.meta.env.MODE === 'production'){
                const datasets = listDatasetsApi();
                const models = listModelsApi();
                
                
            }
        }
    }, []);

    const listDatasetsApi = () => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/list_user_datasets`
        axios.post(url, { email }).then(
            (response) => {
                const data = response.data;
                if (response.error) {
                    alert(data.error)
                } else {
                    console.log(data.tables)
                    setDatasetDropdown(data.tables)
                }
            });
      }

    const listModelsApi = () => {
        const url = `${import.meta.env.VITE_API_URL}/api/model/get_all_models`

        axios.get(url)
            .then(
                (response) => {
                    const data = response.data;
                    if (response.error) {
                      alert(response.error)
                    } else {
                      console.log(data.model_list)
                      setModelDropdown(data.model_list)
                    }
                }
            )

    }

    const handleNextButtonClick = async () => {
        const url = `${import.meta.env.VITE_API_URL}/api/anomalies/test_model_with_dataset`
        const response = await axios.post(url, {
            "model_name": modelName,
            "model_version": modelVersion,
            "stored_tablename": storedTablename,
            "input_threshold": inputThreshold
          }).catch(function (error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
            }
            console.log(error.config);
          });
        if (response.status === 200) {
            console.log(response.data)
            setAnomalyLogId(response.data.anomaly_log_id)
            const url = `${import.meta.env.VITE_API_URL}/api/anomalies/get_anomaly_logs`
            const allAnomalyLogs = await axios.post(url)
            if (allAnomalyLogs.status == 200) {
                getDataSet(storedTablename).then((data) => {
                    setFullDataSet(data)
                });
                getAnomalyIds(response.data.anomaly_log_id).then((data) => {
                    setAnomalyIds(data)
                });
            }

            const targetAnomalyLog = allAnomalyLogs.data.find((log) => log.anomaly_log_id === response.data.anomaly_log_id)
            setAnomalyLogResults(targetAnomalyLog.anomaly_log_results)
            await filterAnomalies()
        }

        history.push('/result');
    };

    const getDataSet = async (tablename) => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/get_user_dataset_data`
        const response = await axios.post(url, { tablename });
        return response.data.dataset
    }

    const getAnomalyIds = async (anomalyLogId) => {
        const url = `${import.meta.env.VITE_API_URL}/api/anomalies/get_anomalies`
        const response = await axios.post(url, { "anomaly_log_id": anomalyLogId });
        return response.data.anomalies
    }

    const filterAnomalies = async () => {
        console.log(fullDataSet)
        const anomaliesList = [];
        for (let i = 0; i < anomalyIds.length; i++) {
            const id = anomalyIds[i];
            console.log(id)
            const anomaly = fullDataSet[id];
            anomaliesList.push(anomaly);
        }
        setAnomalies(anomaliesList);
    }

    const handleSelectDataset = (selectedDataset) => {
        setSelectedDataset(selectedDataset)
        setStoredTablename(selectedDataset)
    }

    const handleSelectModel = (selectedModel) => {
        setSelectedModel(selectedModel)
        const modelName = modelDropdown.find((model) => model.model_id == selectedModel).model_name
        setModelName(modelName)
        const modelVersion = modelDropdown.find((model) => model.model_id == selectedModel).model_version
        setModelVersion(modelVersion)
        if (modelName.includes('Isolation')) {
            setInputThreshold(15)
        } else if (modelName.includes('AutoEncoder')) {
            setInputThreshold(1.3)
        }
    }

    return (
      <div>
        <Container>
        <h1>Build Pipeline</h1>
        <Row>
            <Col>
                <Row>
                    <h2>Choose new data to test</h2>
                </Row>
                <Row className="justify-content-md-center">
                    <Form.Group controlId="datasetSelect" className="mb-3">
                        <Form.Control 
                            as="select"
                            className="dataset-select"
                            onChange={(e) => handleSelectDataset(e.target.value)}
                            value={selectedDataset}
                        >
                            <option value="">Select a dataset</option>
                            {datasetDropdown.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Row>
            </Col>
            <Col>
                <Row>
                    <h2>Choose Model</h2>
                </Row>
                <Row className="justify-content-md-center">
                    <Col>
                        <Form.Group controlId="modelSelect" className="mb-3">
                            <Form.Control as="select" value={selectedModel} onChange={(e) => handleSelectModel(e.target.value)}>
                                <option value="">Select a model</option>
                                {modelDropdown.map((model, index) => (
                                    <option key={index} value={model.model_id}>
                                        {model.model_name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row>
            <Col>
                <Button onClick={handleNextButtonClick}>Next</Button>
            </Col>
        </Row>

        </Container>
      </div>
    );
  }
  
  export default BuildPipelinePage;