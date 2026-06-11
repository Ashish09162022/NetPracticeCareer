import { type FC } from 'react';
import MarkAvailablePageJSX from './markAvailablePageComponents/markAvailablePageJSX/MarkAvailablePageJSX';
import './markAvailablePage.css';

interface MarkAvailablePageProps {}

const MarkAvailablePage: FC<MarkAvailablePageProps> = () => {
  return <MarkAvailablePageJSX />;
};

export default MarkAvailablePage;
