import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../../stores";
import { Row, Col, Container, Form, Button } from 'react-bootstrap';
import SideBar from '../../components/Sidebar';
import AnomalyGrid from '../../components/AnomalyGrid';
import axios from 'axios';

const AnomaliesPage = () => {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const [anomalyId, setAnomalyId] = useState('');
    const [isShowResults, setIsShowResults] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!loggedInStatus) {
        history.push('/login');
    }
    
    const getAnomaliesLogById = async () => {
        setErrorMessage('');
        const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/anomalies/get_anomalies`,
            {
                anomaly_log_id: anomalyId
            }
            ).then((response) => {
                console.log(response.data);
                setIsShowResults(true);
                return response.data;
            }).catch((error) => {
                setIsShowResults(false);
                setErrorMessage('Anomaly log id not found');
                console.error('Error:', error);
            });
        return result;
    }; 

    const handleSubmitButtonOnClick = async () => {
        getAnomaliesLogById();
    }

    return (
        <Container>
            <Row>
                <Col className="col-2">
                    <SideBar />
                </Col>
                <Col className="col-10">
                    <Container>
                        <Row>
                            <Col>
                                <h1>Data Anomalies</h1>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p>Enter the anomaly log id to check the detail</p>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter anomaly log Id"
                                    value={anomalyId}
                                    onChange={(e) => setAnomalyId(e.target.value)} 
                                />
                            </Col>
                        </Row>
                        <Row className="justify-content-center" style={{ marginTop: '50px' }}>
                            <Col className="col-auto">
                                <Button onClick={handleSubmitButtonOnClick}>Submit</Button>
                            </Col>
                        </Row>
                        {isShowResults &&
                            <Row>
                                <Col>
                                    <AnomalyGrid enableActionButton="false"/>
                                </Col>
                            </Row>
                        }
                        {errorMessage &&
                            <Row>
                                <Col>
                                    <p>{errorMessage}</p>
                                </Col>
                            </Row>
                        }
                    </Container>
                </Col>
            </Row>
        </Container>
    );
}

export default AnomaliesPage;
