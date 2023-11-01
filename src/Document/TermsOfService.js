import React from 'react'
import "../css/kame.css";
import { Link } from 'react-router-dom';
import { Footer, Header } from '../PageParts';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';

function TermsOfService() {
  return (
    <>
      <Header />
      <TermsOfUse />
      <PrivacyPolicy />
      <Footer />
    </>
  )
}

export default TermsOfService