import React from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Card, Button } from "react-bootstrap";

const HomePage = () => {
    const history = useHistory();

    const goToUploadDataset = () => {
        history.push('/data/initialisation');
    };

    const goToStartAnomalyDetection = () => {
        history.push('/pipeline/data');
    };

    return (
        <>
            <style>
                {`
                    body {
                        background-image: url(/Background.png);
                        background-size: cover;
                        background-position: center;
                        background-attachment: fixed;
                        margin: 0; /* Removes default margin */
                    }
                    .btn-custom {
                        padding: 20px 40px; /* Increased padding to make the button larger */
                        font-size: 1.5rem; /* Increased font-size for larger text */
                        margin: 10px; /* Margin around the button to create space between the card and the button */
                        width: calc(100% - 20px); /* Calculate width, subtract 20px to account for left and right margins */
                        height: calc(100% - 20px); /* Calculate height, subtract 20px to account for top and bottom margins */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                `}
            </style>
            <Container className="mt-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
                    <Card className="mb-3 text-center" style={{ cursor: 'pointer', width: '100%', maxWidth: '600px', minHeight: '30vh' }}>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <Button variant="primary" className="btn-custom" onClick={goToUploadDataset}>Manage Dataset</Button>
                        </Card.Body>
                    </Card>
                    <Card className="text-center" style={{ cursor: 'pointer', width: '100%', maxWidth: '600px', minHeight: '30vh' }}>
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <Button variant="success" className="btn-custom" onClick={goToStartAnomalyDetection}>Manage Pipeline</Button>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </>
    );
}

export default HomePage;
