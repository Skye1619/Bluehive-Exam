import "./App.css";
import axios from "axios";
import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

function App() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [renderComponents, setRenderComponents] = useState();
  const [buttonLoading, setButtonLoading] = useState(false)

  const [addData, setAddData] = useState({
    title: "",
    description: "",
    status: "not complete",
  });
  const [modalData, setModalData] = useState({
    id: "",
    title: "",
    description: "",
    status: "",
  });
  const [deleteData, setDeleteData] = useState()

  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [del, setDel] = useState(false)
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setAdd(false);
    setDel(false);
  };

  const [value, setValue] = useState();

  const handleChange = (event) => {
    setModalData((prevstate) => ({
      ...prevstate,
      [event.target.name]: event.target.value,
    }));

    console.log(event.target.name, event.target.value);
  };

  useEffect(() => {
    fetchData();
    if (!loading) {
      setRenderComponents(populateData());
    }
  }, [loading]);

  const fetchData = async () => {
    try {
      const data = await axios.get("http://localhost:8000/api/todo");
      const myData = [];

      for (const i of data.data) {
        myData.unshift(i);
      }
      setData(myData);
    } catch (error) {
      console.log(error);
    }
    
    setLoading(false);
  };

  const todoClick = (id, title, description, status) => {
    handleOpen();
    setModalData({ id, title, description, status });
  };

  const modalSubmit = async (event, id) => {
    event.preventDefault();
    setButtonLoading(true)
    try {
      const response = await axios.put(
        `http://localhost:8000/api/todo/${id}`,
        modalData
      );
      console.log(response);

      setModalData({
        id: "",
        title: "",
        description: "",
        status: "",
      });
      setButtonLoading(false)
      location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteClick = (event, id, title, description) => {
    event.stopPropagation();
    setDel(true);
    setDeleteData({id, title, description})
  };

  const handleDelete = async (id) => {
    setButtonLoading(true)
    try {
      const response = await axios.delete(`http://localhost:8000/api/todo/${id}`)
      console.log(response)

      setButtonLoading(false)
      location.reload()
    } catch (error) {
      console.log(error)
    }
  }

  const handleAdd = () => {
    setAdd(true);
  };

  const addSubmit = async (event) => {
    event.preventDefault();
    setButtonLoading(true)
    try {
      const response = await axios.post(
        "http://localhost:8000/api/todo",
        addData
      );
      console.log(response);
      setAddData({
        title: "",
        description: "",
        status: "not complete",
      });
      setButtonLoading(false)
      location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const addChange = (event) => {
    setAddData((prevstate) => ({
      ...prevstate,
      [event.target.name]: event.target.value,
    }));
    console.log(addData);
  };

  const populateData = () => {
    return data.map((d) => {
      const id = d.id;
      let title = d.title.toLowerCase();
      const description = d.description;
      const status = d.status;

      title = title[0].toUpperCase() + title.slice(1);

      return (
        <div
          className="dataCard"
          key={id}
          onClick={() => todoClick(id, title, description, status)}
        >
          <h1>{title}</h1>
          <div className="descriptionContainer">
            <p>{description}</p>
          </div>
          <div className="statusContainer">
            {status === "Completed" ? (
              <CheckCircleIcon color="success" />
            ) : (
              <PriorityHighIcon color="error" />
            )}
            <DeleteIcon onClick={(event) => deleteClick(event, id, title, description)} color="error" />
          </div>

          {data[data.length - 1].id === id ? (
            ""
          ) : (
            <hr style={{ margin: "0 10px" }} key={title + id} />
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="mainContainer">
        <div className="headContainer">
          <Typography variant="h1" className="title">
            To Do
          </Typography>
          <Button
            variant="outlined"
            className="addTask"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Task
          </Button>
        </div>
        <div className="tableContainer">
          {loading ? (
            <Skeleton
              sx={{ bgcolor: "grey.300" }}
              variant="rectangular"
              animation="wave"
              className="loadingPlaceholder"
            />
          ) : data.length === 0 ? ( 
            <div className="noData">
              <Typography variant="h4" textAlign='center' >No To-Do Found!</Typography>
            </div>
          ) : (
            <div className="dataContainer">{renderComponents}</div>
          ) }
        </div>
        <div className="controlContainer">
          <Button>Prev</Button>
          <p className="pageNumber">Page : {page}</p>
          <Button>Next</Button>
        </div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="title"
          aria-describedby="description"
        >
          <Box component="form" sx={style}>
            <Typography variant="h5" component="h2" textAlign="center">
              Edit To Do
            </Typography>
            <Typography variant="h6">Title</Typography>
            <TextField
              variant="outlined"
              name="title"
              fullWidth
              value={modalData?.title}
              onChange={handleChange}
              required
            />
            <Typography variant="h6">Description</Typography>
            <TextField
              variant="outlined"
              name="description"
              fullWidth
              value={modalData?.description}
              onChange={handleChange}
              required
            />
            <Typography variant="h6">Status</Typography>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="status"
              value={modalData?.status}
              onChange={handleChange}
              required
            >
              <FormControlLabel
                value="Completed"
                control={<Radio />}
                label="Completed"
              />
              <FormControlLabel
                value="not complete"
                control={<Radio />}
                label="Not Complete"
              />
            </RadioGroup>
            <Button
              variant="contained"
              fullWidth
              onClick={(event) => modalSubmit(event, modalData.id)}
              type="submit"
              disabled={buttonLoading ? true : false}
            >
              Submit
            </Button>
          </Box>
        </Modal>
        <Modal
          open={add}
          onClose={handleClose}
          aria-labelledby="title"
          aria-describedby="description"
        >
          <Box component="form" sx={style}>
            <Typography variant="h5" component="h2" textAlign="center">
              Add Task
            </Typography>
            <Typography variant="h6">Title</Typography>
            <TextField
              variant="outlined"
              name="title"
              fullWidth
              value={addData.title}
              onChange={addChange}
              required
            />
            <Typography variant="h6">Description</Typography>
            <TextField
              variant="outlined"
              name="description"
              fullWidth
              value={addData.description}
              onChange={addChange}
              required
            />
            <Typography variant="h6">Status</Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={addSubmit}
              type="submit"
              disabled={buttonLoading ? true : false}
            >
              Submit
            </Button>
          </Box>
        </Modal>
        <Modal
          open={del}
          onClose={handleClose}
          aria-labelledby="title"
          aria-describedby="description"
        >
          <Box component="form" sx={style}>
            <Typography variant="h5" component="h2" textAlign="center">
              Are you sure you want to Delete?
            </Typography>
            <hr />
            <div className="deleteDetails" >
              <Typography variant="h5" textAlign='center' >
                {deleteData?.title}
              </Typography>
              <Typography variant="p" >
                {deleteData?.description}
              </Typography>
            </div>
            <div className="deleteOption" >
              <Button variant="contained" color="error" onClick={() => handleDelete(deleteData.id)} disabled={buttonLoading ? true : false} >Yes, Delete!</Button>
              <Button variant="contained" color="success" onClick={handleClose} >Go back!</Button>
            </div>
          </Box>
        </Modal>
      </div>
    </>
  );
}

export default App;
