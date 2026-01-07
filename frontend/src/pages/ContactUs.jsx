import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ContentPages.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://khalafiati.io/api';

function ContactUs() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/settings/contact-us`);

      if (response.data.success) {
        setContact(response.data.data.setting);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      setError('فشل تحميل معلومات الاتصال');
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

  if (!contact) {
    return (
      <Container className="content-page-container">
        <Alert variant="info" className="mt-4">
          معلومات الاتصال غير متوفرة حالياً
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="content-page-container">
      <Card className="content-card shadow-sm">
        <Card.Body>
          <div className="content-header">
            <h1 className="content-title">{contact.title.ar}</h1>
            <p className="content-updated">
              آخر تحديث: {new Date(contact.updatedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="content-body">
            <div dangerouslySetInnerHTML={{ __html: contact.content.ar.replace(/\n/g, '<br />') }} />

            {contact.contactInfo && (
              <div className="contact-info-section mt-5">
                <h3 className="mb-4">معلومات الاتصال</h3>

                <Row className="g-4">
                  {contact.contactInfo.email && (
                    <Col md={6}>
                      <Card className="h-100 contact-info-card">
                        <Card.Body className="d-flex align-items-center">
                          <FaEnvelope className="contact-icon me-3" size={30} />
                          <div>
                            <h6 className="mb-1">البريد الإلكتروني</h6>
                            <a href={`mailto:${contact.contactInfo.email}`} className="text-decoration-none">
                              {contact.contactInfo.email}
                            </a>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}

                  {contact.contactInfo.phone && (
                    <Col md={6}>
                      <Card className="h-100 contact-info-card">
                        <Card.Body className="d-flex align-items-center">
                          <FaPhone className="contact-icon me-3" size={30} />
                          <div>
                            <h6 className="mb-1">رقم الهاتف</h6>
                            <a href={`tel:${contact.contactInfo.phone}`} className="text-decoration-none">
                              {contact.contactInfo.phone}
                            </a>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}

                  {contact.contactInfo.address && (
                    <Col md={12}>
                      <Card className="contact-info-card">
                        <Card.Body className="d-flex align-items-center">
                          <FaMapMarkerAlt className="contact-icon me-3" size={30} />
                          <div>
                            <h6 className="mb-1">العنوان</h6>
                            <p className="mb-0">{contact.contactInfo.address}</p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </Row>

                {contact.contactInfo.socialMedia && (
                  Object.values(contact.contactInfo.socialMedia).some(v => v) && (
                    <div className="social-media-section mt-4">
                      <h4 className="mb-3">تابعنا على وسائل التواصل الاجتماعي</h4>
                      <div className="social-media-links">
                        {contact.contactInfo.socialMedia.facebook && (
                          <a
                            href={contact.contactInfo.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link facebook"
                          >
                            <FaFacebook size={24} />
                          </a>
                        )}
                        {contact.contactInfo.socialMedia.twitter && (
                          <a
                            href={contact.contactInfo.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link twitter"
                          >
                            <FaTwitter size={24} />
                          </a>
                        )}
                        {contact.contactInfo.socialMedia.instagram && (
                          <a
                            href={contact.contactInfo.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link instagram"
                          >
                            <FaInstagram size={24} />
                          </a>
                        )}
                        {contact.contactInfo.socialMedia.linkedin && (
                          <a
                            href={contact.contactInfo.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link linkedin"
                          >
                            <FaLinkedin size={24} />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ContactUs;
