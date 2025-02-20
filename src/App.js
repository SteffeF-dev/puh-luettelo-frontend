import { useEffect, useState } from "react";
import phoneService from "./services/phonebook";
import "./index.css";
const App = () => {
  const [persons, setPersons] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [newFilter, setFilterName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [newStyle, setStyle] = useState("");

  const addSubmit = (event) => {
    event.preventDefault();
    const newObj = {
      id: persons.length + 1,
      name: newName,
      number: newNumber,
    };
    console.log();
    !persons.some((obj) => obj.name === newObj.name)
      ? phoneService.create(newObj).then((returnedPhone) => {
          setPersons(persons.concat(returnedPhone));
          setNewName("");
          setNewNumber("");
          setErrorMessage(`${newObj.name} has been added`);
          setStyle("add");
          setTimeout(() => {
            setErrorMessage(null);
            setStyle("");
          }, 3000);
        })
      : updateNumber();
  };

  const updateNumber = () => {
    const findPerson = persons.find((person) => person.name === newName);
    const changedPerson = { ...findPerson, number: newNumber };
    if (
      window.confirm(
        `${newName} has already been added to the phonebook, replace the old number with new one?`
      )
    ) {
      phoneService
        .update(findPerson.id, changedPerson)
        .then((updatePerson) => {
          setPersons(
            persons.map((person) =>
              findPerson.id === person.id ? updatePerson : person
            )
          );
          setNewName("");
          setNewNumber("");
        })
        .catch((error) => {
          setStyle("error");
          setErrorMessage(
            `Person ${findPerson.name} was already removed from server`
          );
          setTimeout(() => {
            setErrorMessage(null);
            setStyle("");
          }, 2000);
          setPersons(persons.filter((p) => p.id !== findPerson.id));
        });
    }
  };

  const newNameChange = (event) => {
    setNewName(event.target.value);
  };

  const newNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const newFilterChange = (event) => {
    setFilterName(event.target.value);
  };

  useEffect(() => {
    phoneService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} css={newStyle} />
      <Filter searchval={newFilter} filterChange={newFilterChange} />
      <h2>Add a new</h2>
      <PersonForm
        val1={newName}
        val2={newNumber}
        func1={newNameChange}
        func2={newNumberChange}
        add={addSubmit}
      />
      <h2>Numbers</h2>
      <Persons arr={persons} input={newFilter} />
    </div>
  );
};

const Filter = ({ searchval, filterChange }) => {
  return (
    <>
      search: <input value={searchval} onChange={filterChange} />
    </>
  );
};

const PersonForm = ({ val1, val2, func1, func2, add }) => {
  return (
    <>
      <form onSubmit={add}>
        <div>
          name: <input value={val1} onChange={func1} />
        </div>
        <div>
          number: <input value={val2} onChange={func2} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </>
  );
};

const Persons = ({ arr, input }) => {
  const usersToShow =
    input === ""
      ? arr
      : arr.filter((value) =>
          value.name.toLowerCase().includes(input.toLowerCase())
        );
  return (
    <>
      <ul>
        {usersToShow.map((value) => (
          <NNListTemplate key={value.id} obj={value} />
        ))}
      </ul>
    </>
  );
};

const NNListTemplate = ({ obj }) => {
  return (
    <li>
      {obj.name} {obj.number} <Button obj={obj} />
    </li>
  );
};
const Button = ({ obj }) => {
  const deleteFunc = () => {
    if (window.confirm(`Delete ${obj.name}?`)) {
      phoneService.remove(obj.id);
    }
  };
  return <button onClick={deleteFunc}>delete</button>;
};

const Notification = ({ message, css }) => {
  if (message === null) {
    return null;
  }

  return <div className={css}>{message}</div>;
};
export default App;
