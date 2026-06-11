import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import ClientConversationPageJSX from './clientConversationPageComponents/clientConversationPageJSX/ClientConversationPageJSX';
import './clientConversationPage.css';

const ClientConversationPage: FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleGoToBuild = useCallback(() => {
    navigate(PathFor.buildSubmissionPage);
  }, [navigate]);

  return <ClientConversationPageJSX onBack={handleBack} onGoToBuild={handleGoToBuild} />;
};

export default ClientConversationPage;
