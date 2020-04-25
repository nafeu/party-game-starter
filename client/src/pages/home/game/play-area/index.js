import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { SocketContext } from 'react-socket-io';
import { MainContext } from '../../../../context/main';
import { getPlayers, getGameInfo, getCard, getAlertInfo } from '../services';

import Hand from '../components/hand';
import Deck from '../components/deck';
import Pile from '../components/pile';
import Board from '../components/board';
import Mat from '../components/mat';
import Platform from '../components/platform';
import BigAlert from '../components/big-alert';
import SmallAlert from '../components/small-alert';
import PlayerInfo from '../components/player-info';

const ONE_SECOND = 1000;
const TWO_SECONDS = 2000;
const THREE_SECONDS = 3000;
const FIVE_SECONDS = 5000;
const SEVEN_SECONDS = 7000;

function PlayArea({
  joinedRoom
}) {
  const { state } = useContext(MainContext);
  const socket = useContext(SocketContext);
  const { phase, youAreHost, results, isYourTurn, isOpponentsTurn, deck, opponentHiddenCount } = getGameInfo(joinedRoom.gameState, state);
  const { playerOne, playerTwo, activePlayer, you, opponent } = getPlayers(joinedRoom.gameState, state);
  const { alertTitle, alertBody, alertType, recipientId } = getAlertInfo(joinedRoom.gameState, state);

  const [bigAlert, setBigAlert] = useState(false);
  const [neutralSmallAlert, setNeutralSmallAlert] = useState(false);
  const [yourSmallAlert, setYourSmallAlert] = useState(false);
  const [opponentsSmallAlert, setOpponentsSmallAlert] = useState(false);

  const showBigAlert = (aliveMs) => {
    if (!bigAlert) {
      setBigAlert(true);
      setTimeout(() => {
        setBigAlert(false);
      }, aliveMs);
    }
  }

  const showNeutralSmallAlert = (aliveMs) => {
    if (!neutralSmallAlert) {
      setNeutralSmallAlert(true);
      setTimeout(() => {
        setNeutralSmallAlert(false);
      }, aliveMs);
    }
  }

  const showYourSmallAlert = (aliveMs) => {
    if (!yourSmallAlert) {
      setYourSmallAlert(true);
      setTimeout(() => {
        setYourSmallAlert(false);
      }, aliveMs);
    }
  }

  const showOpponentsSmallAlert = (aliveMs) => {
    if (!opponentsSmallAlert) {
      setOpponentsSmallAlert(true);
      setTimeout(() => {
        setOpponentsSmallAlert(false);
      }, aliveMs);
    }
  }

  const goToNextPhase = () => {
    socket.emit('playerInput', {
      input: {
        action: 'NEXT_PHASE',
      },
      roomId: joinedRoom.id
    });
  }

  useEffect(() => {
    if (phase === 'START') {
      showBigAlert(FIVE_SECONDS);
      youAreHost && setTimeout(goToNextPhase, SEVEN_SECONDS);
    }

    if (phase === 'TURN') {
      showBigAlert(TWO_SECONDS);
      youAreHost && setTimeout(goToNextPhase, THREE_SECONDS);
    }

    if (phase === 'DRAW') {
      youAreHost && setTimeout(goToNextPhase, ONE_SECOND);
    }

    if (phase === 'END') {
      youAreHost && setTimeout(goToNextPhase, ONE_SECOND);
    }

    if (phase === 'MATCH') {
      if (recipientId === null) {
        setTimeout(showNeutralSmallAlert(ONE_SECOND), ONE_SECOND);
      } else if (recipientId === you.id) {
        setTimeout(showYourSmallAlert(ONE_SECOND), ONE_SECOND);
      } else {
        setTimeout(showOpponentsSmallAlert(ONE_SECOND), ONE_SECOND);
      }
      youAreHost && setTimeout(goToNextPhase, THREE_SECONDS);
    }

    if (phase === 'RESULTS') {
      showBigAlert(SEVEN_SECONDS);
    }
  }, [phase, youAreHost]);

  const handlePlayCard = (cardId, index) => {
    socket.emit('playerInput', {
      input: {
        action: 'PLAY_CARD',
        cardId,
        index,
      },
      roomId: joinedRoom.id
    });
  }

  const handleNewGame = () => {
    socket.emit('playerInput', {
      input: {
        action: 'NEW_GAME'
      },
      roomId: joinedRoom.id
    });
  }

  const handleOwnerCardClick = (card, index) => {
    if (isYourTurn) {
      handlePlayCard(card.id, index);
    }
  }

  const handleOpponentCardClick = (card, index) => {
    console.log(`Opponents card with index of ${index}`)
  }

  return (
    <React.Fragment>
      <Board>
        <Mat />
        <Platform />
        <Platform position={'top'} color={'red'}/>
        <Hand
          hand={you.hand}
          owner={true}
          handleCardClick={handleOwnerCardClick}
          canClick={isYourTurn}
        />
        <Pile
          pile={you.pile}
          position={'middle'}
          player={'bottom'}
          messiness={5}
        />
        <Hand
          hand={opponent.hand}
          owner={false}
          position={'top'}
          handleCardClick={handleOpponentCardClick}
        />
        <Pile
          pile={opponent.pile}
          position={'middle'}
          player={'top'}
          messiness={5}
          hiddenCount={opponentHiddenCount}
        />
        <Deck
          deck={deck}
          position={'middle'}
        />
        <PlayerInfo
          player={you}
        />
        <PlayerInfo
          player={opponent}
          position={'top'}
        />
        <BigAlert
          title={alertTitle}
          type={alertType}
          body={alertBody}
          show={bigAlert}
        />
        <SmallAlert
          title={alertTitle}
          type={alertType}
          body={alertBody}
          position={'middle'}
          show={neutralSmallAlert}
        />
        <SmallAlert
          title={alertTitle}
          type={alertType}
          body={alertBody}
          position={'bottom'}
          show={yourSmallAlert}
        />
        <SmallAlert
          title={alertTitle}
          type={alertType}
          body={alertBody}
          position={'top'}
          show={opponentsSmallAlert}
        />
        {phase === 'RESULTS' && youAreHost && (
          <button onClick={handleNewGame}>Play again.</button>
        )}
      </Board>
    </React.Fragment>
  );

  // return (
  //   <div>
  //     <h2>{phase}</h2>
  //     <h3>
  //       {phase === 'START' && ('Game will start shortly...')}
  //       {phase === 'TURN' && (`It is ${activePlayer.username}'s turn.`)}
  //       {phase === 'DRAW' && (`${activePlayer.username} is drawing cards.`)}
  //       {phase === 'ACTION' && (`${activePlayer.username} is now deciding what card to play.`)}
  //       {phase === 'END' && (`${activePlayer.username} has picked a card.`)}
  //       {phase === 'MATCH' && (`${playerOne.username} plays ${getCard(playerOne.action).name}, ${playerTwo.username} plays ${getCard(playerTwo.action).name}, ${results.message}.`)}
  //       {phase === 'RESULTS' && (`${results.winner}`)}
  //     </h3>
  //     {_.map(you.hand, (cardId, index) => {
  //       const { name } = getCard(cardId);

  //       if (isYourTurn) {
  //         return (
  //           <button onClick={() => handlePlayCard(cardId, index)}>{name}</button>
  //         );
  //       }

  //       return (
  //         <button disabled>{name}</button>
  //       );
  //     })}
  //     <p>{playerOne.username}'s HP: {playerOne.hp}</p>
  //     <p>{playerTwo.username}'s HP: {playerTwo.hp}</p>
  //     {phase === 'RESULTS' && youAreHost && (
  //       <button onClick={handleNewGame}>Play again.</button>
  //     )}
  //   </div>
  // );
}

export default PlayArea;
