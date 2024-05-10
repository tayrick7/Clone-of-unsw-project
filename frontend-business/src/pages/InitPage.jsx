import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../stores";
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import axios from 'axios';

const InitPage = () => {
    const history = useHistory();
    const email = useAuthStore((state) => state.email);
    const [imageSrc, setImageSrc] = useState('/empty.png');
    const [file, setFile] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    if (!email) {
        history.push('/login');
    }

    const handleClick = async () => {
        const response = await uploadFileApi(email, file);
        if (response.success) {
            alert('Upload successfully!');
            setImageSrc('/csv.png');
        } else {
            setErrorMessage(response.message);
            setImageSrc('/empty.png');
        }
    };

    const handleFileClick = (event) => {
        event.preventDefault();
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    useEffect(() => {
        if(file) {
            setImageSrc('/csv.png');
        } else {
            setImageSrc('/empty.png');
        }
    }, [file]);

    const uploadFileApi = async (user, file) => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', user);
    
        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
    
            if (response.status === 400) {
                return { success: false, message: response.data.message };
            }
            return { success: true };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: 'Upload failed due to an error.' };
        }
    };

    return (
        <Container className="init-page-container">

            <h1>Upload new data</h1>
            <Row>
                <Col><img src={imageSrc} className='csv' alt="csv" /></Col>
            </Row>
            <Row>
                <Col>
                    <div style={{ marginTop: '50px' }}>
                        <input type="file" className='select-file-button' onChange={handleFileClick} id="fileInput" />
                        <Button variant="primary" onClick={handleClick} style={{ marginTop: '20px' }}>Upload a file</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}</Col>
            </Row>
            <Row>
                <Col><Button onClick={() => history.push('/build')}>Next</Button></Col>
                    

            </Row>
        </Container>
    );
    
    
}

export default InitPage;
