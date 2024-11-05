import './App.css';
import { useState, createContext, useEffect } from 'react';
import { Routes, Route, useNavigate} from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import SignupForm from './components/SignupForm/SignupForm';
import SigninForm from './components/SigninForm/SigninForm';
import * as authService from '../src/services/authService'; // import the authservice
import ProjectList from './components/ProjectList/ProjectList';
import { index , create , deleteHoot, update} from './services/projectService';
import HootDetails from './components/HootDetails/HootDetails';
import ProjectForm from './components/ProjectForm/ProjectForm';
export const AuthedUserContext = createContext(null);

const App = () => {
  const [user, setUser] = useState(authService.getUser()); // using the method from authservice
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
      const fetchAllProjects = async () => {
        const projectsData = await index();
        console.log('projectsData: ', projectsData);
        setProjects(projectsData);
      }
      if(user) fetchAllProjects();
  }, [user]); //


  const handleSignout = () => {
    authService.signout();
    setUser(null);
  };

  const handleAddHoot = async (formData) => {
    const newProject = await create(formData);
    setProjects([newProject, ...projects]);
    navigate('/projects');
  }

  const handleDeleteHoot = async (hootId) => {
        console.log('hootId', hootId);

        await deleteHoot(hootId);
        setProjects(projects.filter((hoot) => {
          return (
            hoot._id !== hootId
          )
        }));
        navigate('/projects');
  }

  const handleUpdateProject = async (projectId , formData) => {
      console.log('projectId', projectId);

      const updatedProject = await update(projectId , formData);

      setProjects(projects.map((project) => {
        return (
          projectId === project._id ? updatedProject : project
        )
      }));
      navigate('/projects');
  }

  return (
    <>
      <AuthedUserContext.Provider value={user}>
        <NavBar user={user} handleSignout={handleSignout} />
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path='/projects' element={<ProjectList projects={projects}/>} />
              <Route path='/projects/new' element={<ProjectForm handleAddHoot={handleAddHoot}/>} />
              <Route path='/projects/:projectId' element={<HootDetails handleDeleteHoot={handleDeleteHoot}/> } />
              <Route path='/projects/:projectId/edit' element={<ProjectForm handleUpdateProject={handleUpdateProject}/> } />
            </>
          ) : (
            <Route path="/" element={<Landing />} />
          )}
          <Route path="/signup" element={<SignupForm setUser={setUser} />} />
          <Route path="/signin" element={<SigninForm setUser={setUser} />} />
        </Routes>
      </AuthedUserContext.Provider>
    </>
  );
};

export default App;
