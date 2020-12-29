import React, {useRef} from 'react';
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CancelIcon from '@material-ui/icons/Cancel';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      margin: '20px 0',
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      width: '40%',
      minWidth: '250px',
    },
    paperChild: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    input: {
      width: '50%',
      minWidth: "220px",
      margin: '15px 0'
    },
    contentContainer: {
      display: 'flex',
      margin: '20px 0',
      textTransform: 'uppercase',
      alignItems: 'center',
      flexWrap: 'wrap', 
      width: '100%',
      justifyContent: 'center'
    },
    content: {
      width: '180px',
      textAlign: 'center',
      margin: '10px'
    }
  }),
);

const GET_BOOKMARKS = gql`
  {
    bookmarks {
      id
      title
      url
    }
  }
`;

const ADD_BOOKMARK = gql`
  mutation addBookmar($url: String!, $title: String!) {
    addBookmark(url: $url, title: $title) {
      id
    }
  }
`;

const REMOVE_BOOKMARK = gql`
  mutation removeBookmark($id: ID!) {
    removeBookmark(id: $id) {
      id
    }
  }
`;

const Home = () => {

  const classes = useStyles();

  const [addBookmark] = useMutation(ADD_BOOKMARK);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);
  const { error, loading, data } = useQuery(GET_BOOKMARKS);

  let titleRef = useRef<HTMLInputElement>(null);
  let urlRef = useRef<HTMLInputElement>(null);

  const remove = (id: string) => {
    removeBookmark({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: GET_BOOKMARKS }],
    });
  };

  const handleSubmit = () => {
    console.log(titleRef.current?.value);
    console.log(urlRef.current?.value);
    addBookmark({
      variables: {
        url: titleRef.current?.value,
        title: urlRef.current?.value,
      },
      refetchQueries: [{ query: GET_BOOKMARKS }],
    });
    titleRef.current.value = "";
    urlRef.current.value = "";
  };

  if (error) {
    return <h3>{error}</h3>;
  }
  if (loading) {
    return <h3 style={{textAlign: 'center'}}>Loading...</h3>;
  }
  console.log(data);
  return (
    <div className={classes.root} >
      <Paper className={classes.paper}>
        <div className={classes.paperChild} >
          <TextField className={classes.input} color="secondary" type="text" label="Enter Bookmark Title" inputRef={urlRef} />
          <TextField className={classes.input} color="secondary" inputRef={titleRef} type="text" label="Enter Bookmark Url" />
          <Button color="secondary" variant="outlined" onClick={handleSubmit}>Add Bookmark</Button>
        </div>
        <h2>Bookmarks List</h2>
      </Paper>
      <div className={classes.contentContainer}>
      {data.bookmarks.map((b) => (
        <Paper className={classes.content}  key={b.id}>
          <CancelIcon style={{cursor: 'pointer'}} color="secondary" onClick={() => remove(b.id)} />
          <h3>{b.title}</h3>
          <h3>{b.url}</h3>
        </Paper>
      ))}
      </div>
    </div>
  );
};

export default Home;
