import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTutorials, fetchTutorialById, createTutorial,
  updateTutorial, deleteTutorial, generateTutorial,
  setWizardStep, updateWizard, resetWizard,
} from '../store/tutorialSlice';

const useTutorial = () => {
  const dispatch = useDispatch();
  const { list, current, loading, error, pagination, wizard, generationStatus } = useSelector((state) => state.tutorials);

  return {
    tutorials: list,
    current,
    loading,
    error,
    pagination,
    wizard,
    generationStatus,
    fetchAll: (params) => dispatch(fetchTutorials(params)),
    fetchById: (id) => dispatch(fetchTutorialById(id)),
    create: (data) => dispatch(createTutorial(data)),
    update: (id, data) => dispatch(updateTutorial({ id, data })),
    remove: (id) => dispatch(deleteTutorial(id)),
    generate: (id, outputType) => dispatch(generateTutorial({ id, outputType })),
    setWizardStep: (step) => dispatch(setWizardStep(step)),
    updateWizard: (data) => dispatch(updateWizard(data)),
    resetWizard: () => dispatch(resetWizard()),
  };
};

export default useTutorial;
