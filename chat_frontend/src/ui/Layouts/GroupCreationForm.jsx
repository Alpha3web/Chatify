import { useState } from 'react';
import CreateGroupFormStep1 from '../components/CreateGroupFormStep1';
import CreateGroupFormStep2 from '../components/CreateGroupFormStep2';
import CreateGroupFormStep3 from '../components/CreateGroupFormStep3';

const GroupCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [groupData, setGroupData] = useState({});

  const handleNext = (data) => {
    setGroupData((prevData) => ({ ...prevData, ...data }));
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateGroupFormStep1 onNext={handleNext} prevData={groupData}/>;
      case 2:
        return <CreateGroupFormStep2 onNext={handleNext} onPrev={handlePrev} prevData={groupData}/>;
      case 3:
        return <CreateGroupFormStep3 onNext={handleNext} onPrev={handlePrev} groupData={groupData}/>;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div  className='group-form-container'>
      {renderStep()}
    </div>
  );
};

export default GroupCreationForm;