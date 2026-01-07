import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../styles/ContentPages.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://khalafiati.io/api';

function PrivacyPolicy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings/privacy-policy`);

      if (response.data.success) {
        setPolicy(response.data.data.setting);
      }
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      setError('فشل تحميل سياسة الخصوصية');
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

  if (!policy) {
    return (
      <Container className="content-page-container">
        <Alert variant="info" className="mt-4">
          سياسة الخصوصية غير متوفرة حالياً
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="content-page-container">
      <Card className="content-card shadow-sm">
        <Card.Body>
          <div className="content-header">
            <h1 className="content-title">{policy.title.ar}</h1>
            <p className="content-updated">
              آخر تحديث: {new Date(policy.updatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="content-body">
            <div dangerouslySetInnerHTML={{ __html: policy.content.ar.replace(/\n/g, '<br />') }} />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PrivacyPolicy;
