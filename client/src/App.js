import styled from "styled-components";
import Editor from "rich-markdown-editor";
import React from "react";
import axios from "axios";
import BlockUi from 'react-block-ui';
import classNames from "classnames";
import "react-block-ui/style.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, ButtonGroup, Position, Menu, MenuItem, Classes, Dialog, H4 } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

  const AppContainer = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    align-items: center;
    max-width: 1100px;
    margin-right: auto;
    margin-left: auto;
  `;

  const AppFrame = styled.div`
    width: 60%;
    height: 88vh;
    position: absolute;
    top: 0px;
    flex: 1;
    display: flex;
    flex-direction: column;
    box-shadow: 8px 2px 32px -2px rgba(0, 0, 0, 0.25),
      -8px 2px 22px -7px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    z-index: 1;
    margin-top: 40px;
  `;

  const StyledEditorFrame = styled(BlockUi)`
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  `;

  const Heading = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.7rem;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
    padding-bottom: 0.7rem;
    border-bottom: 0.5px solid #f0f0f0;
    box-shadow: 0 2px 2px #f0f0f0;
    z-index: 1;
  `;

  const StyledEditor = styled(Editor)`
    padding: 20px;
    padding-left: 35px;
    scroll-behavior: smooth;
  `;

  const Feed = styled.div`
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background-color: #fff;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  `

  const FeedList = styled.div`
    padding-left: 0;
    margin-bottom: 0.25rem;
    list-style: none;
    font-size: 14px;
  `

  const FeedListItem = styled.li`
    padding: 0;
    margin: 0;
    cursor: pointer;
    &:hover {
      background-color: #f0f0f0;
    }
  `;

  const FeedItem = styled.div`
    display: block;
    padding-top: 0.25rem;
    padding-right: 0.75rem;
    padding-bottom: 0.25rem;
    padding-left: 20px;
    text-decoration: none !important
  `

  const FeedItemTitle = styled.div`
    display: block;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  `
  const FeedItemDoc = styled.div`
    display: flex;
    align-items: center;
    word-wrap: break-word;
  `

  const FeedItemExcerpt = styled.div`
    display: block;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    margin-left: 0.5rem;
    word-wrap: break-word;
    border-left: 1px solid;
    border-left-color: #f0f0f0;
    font-size: 11px !important;
  `

  const NoExcerpt = styled.p`
    background: #f0f0f0;
    text-decoration: none;
    display: inline-block;
    padding: 0 12px;
    border-radius: 32px;
    height: auto;
    vertical-align: middle;
    font-size: 13px;
  `


function Write({value, setIsView, setIsHome}) {
  setIsView(false);
  setIsHome(false);
  return (
    <StyledEditor
      placeholder="Write your story here..."
      value={value}
      onSave={(options) => console.log("We constantly take back up of your work in the localStorage, just click Publish to save it to the database. You don't have to press Ctrl + S")}
      onChange={(value) => {
        const text = value();
        console.log(text);
        localStorage.setItem("saved", text);
      }}
    />
  );
}

function Home({items, isView, setIsView}) {
  const [value, setValue] = useState("");

  const handleClick = (item, index) => {
    setValue(item);
    setIsView(true);
  };

  const feedItemsList = items.map((item, index) => {
    const title = item.split("\n").slice(0, 1).join("\n")
      ? item.split("\n").slice(0, 1).join("\n")
      : "";
    const excerpt = (item.length - title.length + 1 - 150) > 0 ? item.substring(title.length + 1, title.length + 1 + 150) : <NoExcerpt>No excerpt</NoExcerpt>;
    return (
        <FeedListItem key={index}>
          <FeedItem onClick={(event) => handleClick(item, index)}>
            <FeedItemTitle><FeedItemDoc><strong>{title}</strong></FeedItemDoc></FeedItemTitle>
            <FeedItemExcerpt>{excerpt}</FeedItemExcerpt>
          </FeedItem>
        </FeedListItem>
    );
  });

  return (
    <Feed>
      <FeedList>
        { !isView ?
        <>{feedItemsList}</>
        :
        <StyledEditor value={value} readOnly={true} />  
        } 
      </FeedList>
    </Feed>
  );
}

function App() {

  const savePost = (event) => {
    event.preventDefault();
    const text = localStorage.getItem("saved");
    axios
      .post("http://localhost:5000/publish", {
        content: text,
      })
      .then((response) => {
        console.log(response.data.msg);
      })
      .catch(() => {
        console.log("Internal Server Error");
      });
  };


  const [editorValue, setEditorValue] = useState("");

  const [feedItems, setFeedItems] = useState([]);
  
  const [isHome, setIsHome] = useState(false);
  const [isView, setIsView] = useState(false);

  const onHome = useCallback(
    (event) => {
      event.preventDefault();
      setIsHome(true);
      setIsView(false);
      axios
        .get("http://localhost:5000/all")
        .then((response) => {
          let items = [];
          for (let i = 0; i < response.data.length; i++) {
            items.push(response.data[i].content);
          }
          setFeedItems(items);
          console.log("Getting All Posts");
        })
        .catch(() => {
          console.log("Internal Server Error");
        });
    }, [setIsHome, setFeedItems]
  );
   
  const onWrite = useCallback(
    (event) => {
      event.preventDefault();
      setIsHome(false);
      setEditorValue("");
    }, [setIsHome, setEditorValue]
  );

  const [isLoading, setIsLoading] = useState(false);

  const analyzePost = useCallback((event) => {
    event.preventDefault();
    setIsLoading(true);
    console.log("Analyzing post...");
    var text = localStorage.getItem("saved");
    text = text.replace(/==/g, "");
    var content = text.match(/[^.?!]+[.!?]+[\])'"`’”]*|.+/g);
    var responseCtr = content.length;
    for (var i = 0; i < content.length; i++) {
      axios
        .post("http://localhost:5000/analyze", {
          content: content[i],
        })
        // eslint-disable-next-line no-loop-func
        .then((response) => {
          responseCtr--;
          if (responseCtr === 0) {
            setIsLoading(false);
          }
          const data = response.data;
          const sentence = data.split("::")[0].trim();
          let sentiment = data.split("::")[1];
          sentiment = sentiment.replace(/'/g, '"');
          const toxicityScore = JSON.parse(sentiment).toxicity;
          
          let saved = localStorage.getItem("saved");
          if (toxicityScore > 0.005) {
            saved = saved.replace(sentence, `==${sentence}==`);
          } 
          localStorage.setItem("saved", saved);
          setEditorValue(saved);
        })
        .catch((e) => {
          console.log("Internal Server Error", e);
        });
    }
    
  }, [setIsLoading, setEditorValue]);

  const [isOpen, handleDialogChange] = useState(false);
  const handleOpen = () => handleDialogChange(true);
  const handleClose = () => handleDialogChange(false);
  
  const menu = (
    <>
      <Menu>
        <MenuItem onClick={onWrite} icon="annotation" text="New Post" />
        {isView && (
          <MenuItem onClick={onHome} icon="list-detail-view" text="Feed" />
        )}
        {!isHome && (
          <>
            <MenuItem
              onClick={savePost}
              icon="send-to-graph"
              text="Publish Post"
            />
            <MenuItem onClick={analyzePost} icon="clean" text="Analyze Post" />
            <MenuItem onClick={onHome} icon="list-detail-view" text="Feed" />
          </>
        )}
        <MenuItem onClick={handleOpen} icon="help" text="Help" />
      </Menu>
    </>
  );



  return (
    <AppContainer>
      <AppFrame>
        <Heading>
          <svg
            width="82"
            height="31"
            viewBox="0 0 82 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.8661 17.2283H28.0767C28.0447 15.2841 26.4467 13.9418 24.0178 13.9418C21.6261 13.9418 19.8736 15.2628 19.8842 17.2443C19.8789 18.853 21.0135 19.7745 22.8565 20.2166L24.0444 20.5149C25.2322 20.8026 25.8928 21.1435 25.8981 21.8786C25.8928 22.6776 25.1364 23.2209 23.9645 23.2209C22.766 23.2209 21.9031 22.6669 21.8285 21.5749H19.5966C19.6552 23.9347 21.3438 25.1545 23.9911 25.1545C26.6545 25.1545 28.2205 23.8814 28.2259 21.8839C28.2205 20.0675 26.8516 19.1033 24.9553 18.6772L23.9751 18.4428C23.027 18.2244 22.2333 17.8729 22.2493 17.0898C22.2493 16.3867 22.8725 15.87 24.0018 15.87C25.1044 15.87 25.7809 16.3707 25.8661 17.2283ZM29.7346 25H32.0038V16.8182H29.7346V25ZM30.8746 15.7635C31.551 15.7635 32.105 15.2468 32.105 14.6129C32.105 13.9844 31.551 13.4677 30.8746 13.4677C30.2034 13.4677 29.6494 13.9844 29.6494 14.6129C29.6494 15.2468 30.2034 15.7635 30.8746 15.7635ZM37.5076 28.2386C39.8461 28.2386 41.508 27.1733 41.508 25.0799V16.8182H39.2548V18.1925H39.1696C38.8659 17.5266 38.2001 16.7116 36.8311 16.7116C35.036 16.7116 33.5179 18.1072 33.5179 20.8931C33.5179 23.6151 34.9934 24.8828 36.8365 24.8828C38.1415 24.8828 38.8713 24.2276 39.1696 23.5511H39.2654V25.0479C39.2654 26.1719 38.5463 26.6087 37.5609 26.6087C36.5595 26.6087 36.0534 26.1719 35.867 25.6765L33.7683 25.9588C34.04 27.2479 35.3024 28.2386 37.5076 28.2386ZM37.5556 23.1783C36.4423 23.1783 35.835 22.294 35.835 20.8825C35.835 19.4922 36.4316 18.5174 37.5556 18.5174C38.6582 18.5174 39.2761 19.4496 39.2761 20.8825C39.2761 22.326 38.6475 23.1783 37.5556 23.1783ZM45.5829 20.2699C45.5882 19.2152 46.2168 18.5973 47.133 18.5973C48.0439 18.5973 48.5925 19.1939 48.5872 20.1953V25H50.8564V19.7905C50.8564 17.8835 49.7377 16.7116 48.0332 16.7116C46.8187 16.7116 45.9398 17.3082 45.5723 18.2617H45.4764V16.8182H43.3137V25H45.5829V20.2699ZM54.914 14.0909H52.6448V25H54.914V14.0909ZM60.4604 25.1598C62.4846 25.1598 63.8482 24.1744 64.1678 22.6562L62.0691 22.5178C61.84 23.141 61.2541 23.4659 60.4977 23.4659C59.3631 23.4659 58.644 22.7148 58.644 21.495V21.4897H64.2157V20.8665C64.2157 18.0859 62.5325 16.7116 60.3699 16.7116C57.9622 16.7116 56.4015 18.4215 56.4015 20.9464C56.4015 23.5405 57.9409 25.1598 60.4604 25.1598ZM58.644 20.0835C58.6919 19.1513 59.4004 18.4055 60.4071 18.4055C61.3926 18.4055 62.0744 19.1087 62.0797 20.0835H58.644ZM72.5041 19.1513C72.3017 17.6438 71.0872 16.7116 69.0204 16.7116C66.927 16.7116 65.5474 17.6811 65.5527 19.2578C65.5474 20.483 66.3198 21.2766 67.9178 21.5962L69.3347 21.8786C70.0485 22.0224 70.3734 22.2834 70.3841 22.6935C70.3734 23.1783 69.8461 23.5245 69.0524 23.5245C68.2427 23.5245 67.7047 23.1783 67.5662 22.5124L65.3343 22.6296C65.5474 24.1957 66.8791 25.1598 69.0471 25.1598C71.1671 25.1598 72.6852 24.0785 72.6905 22.4645C72.6852 21.282 71.9128 20.5735 70.3255 20.2486L68.8446 19.9503C68.0829 19.7852 67.8006 19.5241 67.8059 19.13C67.8006 18.6399 68.3546 18.3203 69.0577 18.3203C69.8461 18.3203 70.3148 18.7518 70.4267 19.2791L72.5041 19.1513ZM80.9269 19.1513C80.7245 17.6438 79.51 16.7116 77.4433 16.7116C75.3499 16.7116 73.9703 17.6811 73.9756 19.2578C73.9703 20.483 74.7426 21.2766 76.3406 21.5962L77.7575 21.8786C78.4713 22.0224 78.7963 22.2834 78.8069 22.6935C78.7963 23.1783 78.2689 23.5245 77.4752 23.5245C76.6656 23.5245 76.1276 23.1783 75.9891 22.5124L73.7572 22.6296C73.9703 24.1957 75.3019 25.1598 77.4699 25.1598C79.5899 25.1598 81.108 24.0785 81.1134 22.4645C81.108 21.282 80.3357 20.5735 78.7483 20.2486L77.2675 19.9503C76.5058 19.7852 76.2235 19.5241 76.2288 19.13C76.2235 18.6399 76.7774 18.3203 77.4806 18.3203C78.2689 18.3203 78.7377 18.7518 78.8495 19.2791L80.9269 19.1513Z"
              fill="url(#paint0_linear_2_32)"
            />
            <path
              d="M8.405 8.30389C8.405 8.30389 7.97272 17.5441 9.31302 19.1806C10.6533 20.8171 13.5999 18.4039 13.5999 18.4039C13.5999 18.4039 14.7727 19.8358 15.6104 20.8586C16.4481 21.8815 20.1313 18.8649 19.2936 17.8421C18.4559 16.8193 17.1156 15.1827 17.1156 15.1827M8.405 8.30389C8.405 8.30389 17.03 9.44272 18.7053 11.4884C20.3807 13.534 17.2832 15.3873 17.2832 15.3873M8.405 8.30389L13.096 14.0317"
              stroke="url(#paint1_linear_2_32)"
            />
            <ellipse
              cx="13.6739"
              cy="14.4078"
              rx="1.27639"
              ry="1.41779"
              transform="rotate(-39.3173 13.6739 14.4078)"
              fill="#314987"
            />
            <path
              d="M11.4756 25.9538L11.6323 25.0181M15.6538 1.00001L13.8122 2.5083M15.6538 1.00001L16.8266 2.43196L16.9941 2.63653M15.6538 1.00001L11.9457 23.1465M11.6323 25.0181L9.76322 25.7414M11.6323 25.0181L13.05 26.3733M11.6323 25.0181L11.789 24.0823M11.789 24.0823L9.9199 24.8056M11.789 24.0823L13.2674 25.5117M11.789 24.0823L11.9457 23.1465M11.9457 23.1465L9.98444 23.7574M11.9457 23.1465L13.4848 24.6501"
              stroke="url(#paint2_linear_2_32)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear_2_32"
                x1="23.5"
                y1="11"
                x2="82"
                y2="11"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.104167"
                  stopColor="#314987"
                  stopOpacity="0.85"
                />
                <stop
                  offset="0.661458"
                  stopColor="#3C4D87"
                  stopOpacity="0.523872"
                />
                <stop offset="1" stopColor="#6E7DAE" stopOpacity="0.26" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_2_32"
                x1="8.31292"
                y1="8.37931"
                x2="17.9882"
                y2="20.1929"
                gradientUnits="userSpaceOnUse"
              >
                <stop
                  offset="0.171875"
                  stopColor="#6E7DAE"
                  stopOpacity="0.64"
                />
                <stop offset="0.5" stopColor="#3C4D87" />
                <stop offset="0.9375" stopColor="#314987" stopOpacity="0.77" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_2_32"
                x1="7.82692"
                y1="7.41022"
                x2="19.2194"
                y2="21.3206"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#6E7DAE" stopOpacity="0.29" />
                <stop offset="0.526042" stopColor="#3C4D87" />
                <stop offset="0.916667" stopColor="#314987" />
              </linearGradient>
            </defs>
          </svg>

          <Popover2 content={menu} placement={Position.BOTTOM}>
            <Button minimal={"true"} icon="cog" />
          </Popover2>
        </Heading>
        <StyledEditorFrame
          tag="div"
          blocking={isLoading}
          message="Loading... Please wait!"
          keepInView
        >
          {isHome ? (
            <Home items={feedItems} isView={isView} setIsView={setIsView} />
          ) : (
            <Write
              value={editorValue}
              setIsView={setIsView}
              setIsHome={setIsHome}
            />
          )}
        </StyledEditorFrame>
        <Dialog
          icon="help"
          onClose={handleClose}
          title="Help"
          autoFocus={true}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={true}
          isOpen={isOpen}
          usePortal={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <H4>Steps to publish a post:</H4>
            <ol>
              <li>Click on the Editor.</li>
              <li>Write a nice little story...</li>
              <li>Click on the gear icon on the right of the editor.</li>
              <li>Hit Publish!</li>
            </ol>
            <H4>Steps to check the post for political correctness:</H4>
            <ol>
              <li>Click on the Editor.</li>
              <li>Write a nice little story...</li>
              <li>Click on the gear icon on the right of the editor.</li>
              <li>Hit Analyse Post and Wait.</li>
              <li>
                Once the analysis is done, you'll see that the politically incorrect
                sentences are highlighted.
              </li>
            </ol>
            <H4>Steps to checked the published posts:</H4>
            <ol>
              <li>Click on the gear icon on the right of the editor.</li>
              <li>Click on feed.</li>
              <li>You should find all the posts listed in chronological order.</li>
            </ol>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        </Dialog>
      </AppFrame>
    </AppContainer>
  );
}

export default App;
