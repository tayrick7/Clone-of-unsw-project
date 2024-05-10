/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';

import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { AnomalyTable } from '../components/AnomalyTable';

import axios from 'axios'
import { useHistory } from 'react-router-dom';
import { useAuthStore, useAnomalyStore, usePipelineStore } from "../stores";
import { MutatingDots, MagnifyingGlass } from 'react-loader-spinner';

function ResultPage() {
    const history = useHistory();
    const email = useAuthStore((state) => state.email);
    const anomalyLogId = useAnomalyStore((state) => state.anomalyLogId);
    const anomalyLogResults = useAnomalyStore((state) => state.anomalyLogResults);
    const storedTablename = usePipelineStore((state) => state.stored_tablename);
    const fullDataSet = useAnomalyStore((state) => state.fullDataSet);
    const anomalyIds = useAnomalyStore((state) => state.anomalyIds);
    const anomalies = useAnomalyStore((state) => state.anomalies);
    const setAnomalies = useAnomalyStore((state) => state.setAnomalies);

    const rejectedAnomalies = useAnomalyStore((state) => state.rejectedAnomalies);
    
    useEffect(() => {
        if (!email) {
            history.push('/login');
        }            
        
    });

    const handleDoneButtonClick = async () => {
        const output = []
        for (let i = 0; i < rejectedAnomalies.length; i++) {
            const anomalyId = rejectedAnomalies[i];
            const rejectedAnomaly = anomalies.find((anomaly) => anomaly.id === anomalyId);
            output.push(rejectedAnomaly);
        }
        downloadObjectAsJson(output, `${Date.now()}_rejected_anomalies`);
    }

    function downloadObjectAsJson(exportObj, exportName){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }

    return (
      <div>
        <Container>
        <h1>Anomalies</h1>
        <Row>
            <Col className="d-flex justify-content-center">
                <AnomalyTable />
            </Col>
        </Row>
        <Row>
            <Col className="d-flex justify-content-center">
                <Button onClick={handleDoneButtonClick}>Done</Button>
            </Col>
        </Row>

        </Container>
      </div>
    );
  }
  
  export default ResultPage;