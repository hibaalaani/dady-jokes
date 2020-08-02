import React, { Component } from "react";
import Joke from "./Joke";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import emoPink from "./img/0eb14c71-38f2-433a-bfc8-23d9c99b3647 (3).svg";
import "./JokeList.css";
class JokeList extends Component {
  static defaultProps = {
    jokesNum: 10,
  };
  constructor() {
    super();
    this.state = {
      loading: false,
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), //to get the jokes as object
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text)); ///to make new set of jokes and check if there is dublicate
    this.getJokes = this.getJokes.bind(this);
    this.getNewJokes = this.getNewJokes.bind(this);
  }
  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }
  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.jokesNum) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJokes = res.data.joke;

        if (!this.seenJokes.has(newJokes)) {
          jokes.push({ id: uuidv4(), text: newJokes, votes: 0 });
        } else {
          console.log("here duplicate");
          console.log(newJokes);
        }
      }
      this.setState(
        (st) => ({
          loading: false,
          jokes: [...st.jokes, ...jokes],
        }),
        () =>
          ///this will wait untill the state updated then its call
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)) //to convert jokes array to string
      );
    } catch (err) {
      alert(err);
      this.setState({
        loading: false,
      });
    }
  }
  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  getNewJokes = () => {
    this.setState(
      {
        loading: true,
      },
      this.getJokes
    );
  };
  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading.....</h1>
        </div>
      );
    }
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img className="lughedEmo" src={emoPink} alt="emoji" />
          <button className="buttonMore" onClick={this.getNewJokes}>
            New Jokes{" "}
          </button>
        </div>
        <div className="JokeList-jokes">
          {this.state.jokes.map((joke) => (
            <div key={joke.id}>
              <Joke
                text={joke.text}
                votes={joke.votes}
                upVote={() => this.handleVote(joke.id, 1)}
                downVote={() => {
                  this.handleVote(joke.id, -1);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}
export default JokeList;
