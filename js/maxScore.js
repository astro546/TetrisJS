window.onload = function () {
  const scoreText = document.querySelector('.current-score');
  const maxScoreText = document.querySelector('.max-score');
  const scoreNumber = Number(sessionStorage.getItem('currentScore'));
  let maxScoreNumber = 0;

  storeScore = () => {
    return new Promise((resolve) => {
      if ('maxScore' in localStorage) {
        maxScoreNumber = Number(localStorage.getItem('maxScore'));
        if (scoreNumber > maxScoreNumber)
          localStorage.setItem('maxScore', `${scoreNumber}`);
        resolve();
      } else {
        localStorage.setItem('maxScore', '0');
        resolve();
      }
    });
  };

  storeScore().then(() => {
    scoreText.textContent = scoreNumber ? scoreNumber : 0;
    maxScoreText.textContent = localStorage.getItem('maxScore');
  });
};
