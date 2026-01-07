import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../styles/ContentPages.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://khalafiati.io/api';

function TermsOfService() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings/terms-of-service`);

      if (response.data.success) {
        setTerms(response.data.data.setting);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
      setError('فشل تحميل شروط الاستخدام');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="content-page-container">
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">جاري التحميل...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="content-page-container">
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!terms) {
    return (
      <Container className="content-page-container">
        <Alert variant="info" className="mt-4">
          شروط الاستخدام غير متوفرة حالياً
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="content-page-container">
      <Card className="content-card shadow-sm">
        <Card.Body>
          <div className="content-header">
            <h1 className="content-title">{terms.title.ar}</h1>
            <p className="content-updated">
              آخر تحديث: {new Date(terms.updatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="content-body">
            <div dangerouslySetInnerHTML={{ __html: terms.content.ar.replace(/\n/g, '<br />') }} />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TermsOfService;
