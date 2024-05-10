/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';

import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';

import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { useAuthStore, usePipelineStore } from "../stores";
import { MutatingDots, MagnifyingGlass } from 'react-loader-spinner';

function ProgressPage() {
    const history = useHistory();
    const email = useAuthStore((state) => state.email);
    const modelName = usePipelineStore((state) => state.model_name);
    const modelVersion = usePipelineStore((state) => state.model_version);
    const storedTablename = usePipelineStore((state) => state.stored_tablename);
    const inputThreshold = usePipelineStore((state) => state.input_threshold);


    const [isLoading, setIsLoading] = useState(false);
    const [isWaitingInput, setIsWaitingInput] = useState(false);
    const [currentProgressPercentage, setCurrentProgressPercentage] = useState(0);

    useEffect(() => {
        if (!email) {
            history.push('/login');
        }
    });

    const handleNextButtonClick = async () => {
        setIsLoading(true);
        setIsWaitingInput(false);
    };

    const handleForceNextButtonClick = () => {
        setIsLoading(false);
        setIsWaitingInput(true);
        setCurrentProgressPercentage(currentProgressPercentage + 33.34);
    }


    return (
      <div>
        <Container>
        <h1>Business Pipeline</h1>
        <Row>
            <Col className="d-flex justify-content-center">
                {
                    isLoading && 
                    <>
                            <Row>
                                <Col>
                                <MutatingDots
                                    visible={true}
                                    height="100"
                                    width="100"
                                    color="#4fa94d"
                                    secondaryColor="#4fa94d"
                                    radius="12.5"
                                    ariaLabel="mutating-dots-loading"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                />
                                </Col>
                            </Row>

                            <Row>
                                <Col>

                                <p>Arbitrary step </p>
                                </Col>
                            </Row>


                    </>
                }
                {
                    isWaitingInput && 
                    <>
                        <MagnifyingGlass
                            visible={true}
                            height="80"
                            width="80"
                            ariaLabel="magnifying-glass-loading"
                            wrapperStyle={{}}
                            wrapperClass="magnifying-glass-wrapper"
                            glassColor="#c0efff"
                            color="#e15b64"
                        />
                        <p>Require user input for something</p>
                    </>
                }
            </Col>
        </Row>
        <Row>
            <Col>
                <Row>
                    <Col>
                        <ProgressBar animated now={currentProgressPercentage} />
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row>
            <Col className="d-flex justify-content-center">
                {!isLoading && currentProgressPercentage < 100 && 
                    <Button onClick={handleNextButtonClick}>Next</Button> 
                }
                {!isLoading && currentProgressPercentage >= 100 &&
                    <Button onClick={() => history.push('/result')}>Done</Button>
                }

                {isLoading && currentProgressPercentage < 100 && 
                    <Button className='btn-secondary' onClick={handleForceNextButtonClick}>Force Next</Button> 
                }

                
            </Col>
        </Row>

        </Container>
      </div>
    );
  }
  
  export default ProgressPage;