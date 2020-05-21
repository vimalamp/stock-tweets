import React, { useState, useEffect } from 'react';
import './App.css';
import Axios from 'axios';


function App() {
  
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [tickerTweets, setTickerTweets] = useState({})

  const removeTicker = key => {
    const newTickerTweets = {...tickerTweets};
    delete newTickerTweets[key];
    setTickerTweets(newTickerTweets);
  }

  const [isError, setIsError] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const fetchData = async (tick) => {
    if (!tick) return;
    setIsError(false);
    try {
      const result = await Axios(
        `https://api.stocktwits.com/api/2/streams/symbol/${tick}.json`
      );
      const tweets=result.data.messages;
      setTickerTweets({...tickerTweets, [tick]: tweets });
    } catch (error) {
      setIsError(true);
    }
  }

  useEffect(() => { fetchData(query) }, [query] )

  useEffect(() => {
    const interval = setInterval(
      () => {
        Object.keys(tickerTweets).forEach( key => 
      fetchData(key)
      )}, 5000
    );
    return () => clearInterval(interval);
  });

  return (

    <div className="App">
      <h1>Stock Tweets</h1>
      <form onSubmit={ (e) => {
            e.preventDefault();
            if (!value) return;
            if (value in tickerTweets) {
              setIsDuplicate(true);
              return           
            } ;
            setQuery(value);
            setValue(''); 
          }}>
        <input 
        type="text" 
        value={value} 
        onChange={ e => {
          setIsDuplicate(false);
          setValue(e.target.value.toUpperCase()) }
        }
        placeholder="Enter a symbol, e.g. MSFT"/>
        <button type="submit">Add</button>
      { isError && <div className='notification'>Ticker wasn't found</div>}
      { isDuplicate && <div className='notification'>You're already following this ticker</div>}
      </form>
      <div className="tickers">
        { Object.keys(tickerTweets).map( (key, index) =>
        <div key={index}>
        <div className='ticker-container'>
          <div className="ticker-info">
            <div className="ticker-name">{key}</div>
            <button onClick={ () => { removeTicker(key) } }>x</button>
          </div>
          <div className="tweets-container">
            {tickerTweets[key].map( (tw, ind) => 
              <div key={ind} className="tweet">{tw.body}</div>
            )}
          </div>
        </div>
        <div className="tweetCount">{tickerTweets[key].length}</div>
        </div>) 
          } 
      </div>
    </div>
  );
}

export default App;
