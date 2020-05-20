import React, {Component} from 'react';
import {Route, Link, Redirect } from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import {getNotesForFolder, findNote, findFolder} from '../notes-helpers';
import './App.css';
import NotefulContext from '../NotefulContext';

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            notes: [],
            folders: []
        };
    }
    
    
    componentDidMount = () => {
        let newNotes = []; //1
        let newFolders = []; //2
        fetch('http://localhost:9090/notes') //4
            .then(res => {
                if(!res.ok) { //4.1
                    throw new Error(res.status); //4.2
                } return res.json() //4.2
                }).then (data => { 
                    this.setState({ notes: data }) //4.4
                }).catch(err => 
                    console.log(err));

        fetch('http://localhost:9090/folders') //5
            .then(res => {
                if(!res.ok) { //5.1
                    throw new Error(res.status); //5.2
                } return res.json() //5.2
            }).then(data => {
                this.setState({ folders: data }) //5.4
            }).catch(err => 
                console.log(err));

        this.setState({
            notes: newNotes,
            folders: newFolders
        }) //4.01/5.01
        
    }

    deleteNote = (id) => {
        fetch(`http://localhost:9090/notes/${id}`, {
            method: 'DELETE',
            headers: {
              'content-type': 'application/json'
            },
          }).then(res => {
              if(!res.ok) {
                throw new Error('Something went wrong')
              } return res.json()
          }).then(data => {
              this.setState({
                  notes: this.state.notes.filter(note => note.id !== id)
              })
          })

    }

    renderNavRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => (
                            <NoteListNav />
                        )}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId) || {};
                        const folder = findFolder(folders, note.folderId);
                        return <NotePageNav  {...routeProps} folder={folder}/>;
                         
                    }}
                />
                <Route path="/add-folder" component={NotePageNav} />
                <Route path="/add-note" component={NotePageNav} />
            </>
        );
    }

    renderMainRoutes() {
        const { notes } = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => {
                            const {folderId} = routeProps.match.params;
                            const notesForFolder = getNotesForFolder(
                                notes,
                                folderId
                            );
                            return (
                                <NoteListMain
                                    {...routeProps}
                                    notes={notesForFolder}
                                />
                            );
                        }}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId);
                        if(!note) {
                            return <Redirect to='/' />
                        } return <NotePageMain {...routeProps} note={note} />;
                    }}
                />
            </>
        );
    }

    render() {
        return (
          <NotefulContext.Provider value={{
              notes: this.state.notes,
              folders: this.state.folders,
              deleteNote: this.deleteNote
          }}>
             <div className="App">
                <nav className="App__nav">{this.renderNavRoutes()}</nav>
                <header className="App__header">
                    <h1>
                        <Link to="/">Noteful</Link>{' '}
                        <FontAwesomeIcon icon="check-double" />
                    </h1>
                </header>
                <main className="App__main">{this.renderMainRoutes()}</main>
            </div>
          </NotefulContext.Provider>
        );
    }
}

export default App;
