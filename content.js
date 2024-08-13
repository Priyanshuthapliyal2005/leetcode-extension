const getUserIdFromUrl = () => {
  const path = window.location.pathname;
  const regex = /\/u\/([a-zA-Z0-9_-]+)|\/([a-zA-Z0-9_-]+)\/?/; // Adjusted regex
  const matches = path.match(regex);
  return matches ? matches[1] || matches[2] : null;
};

const replaceNameWithCheater = () => {
  const nameElementSelector = '.text-label-1.dark\\:text-dark-label-1.break-all.text-base.font-semibold';
  const nameElement = document.querySelector(nameElementSelector);

  if (nameElement) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const targetElement = document.querySelector(nameElementSelector);
          if (targetElement && targetElement.innerText !== 'CHEATER') {
            targetElement.innerText = 'CHEATER';
          }
        }
      });
    });

    observer.observe(nameElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    console.log("Initial change to CHEATER");
    nameElement.innerText = 'CHEATER'; // Initial change
  } else {
    console.error("Name element not found.");
  }
};

const fetchContestHistory = async (username, contributionPoints) => { // Added contributionPoints as parameter
  try {
    const response = await fetch('https://leetcode-proxy.onrender.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query userContestRankingHistory($username: String!) {
            userContestRankingHistory(username: $username) {
              attended
              problemsSolved
              ranking
              rating
              contest {
                title
                startTime
              }
            }
          }
        `,
        variables: { username: username },
      }),
    });

    const result = await response.json();
    const contestHistory = result.data.userContestRankingHistory || [];

    const contestHistoryWithPrevRating = contestHistory.map((contest, index) => {
      const prevRating = index === 0 ? 1500 : contestHistory[index - 1].rating;
      return { ...contest, prevRating };
    });

    const cheatedContests = contestHistoryWithPrevRating.filter(
      (contest) =>
        contest.problemsSolved === 0 &&
        contest.rating < contest.prevRating &&
        contributionPoints < 100
    );

    return (cheatedContests.length > 1 && cheatedContests.length <= 3) && contributionPoints < 100;
  } catch (err) {
    console.error("Error fetching contest history:", err);
    return false;
  }
};

// Main code
const userId = getUserIdFromUrl();
console.log("User ID:", userId);

if (userId) {
  const contributionPoints = 50; // Example value, adjust as needed or fetch this data as required
  fetchContestHistory(userId, contributionPoints).then((isCheater) => {
    if (isCheater) {
      replaceNameWithCheater();
      const nameElement = document.querySelector('.mr-2.text-label-1.dark\\:text-dark-label-1.break-all.text-base.font-semibold');
    }
  }).catch((err) => {
    console.error("Error in fetchContestHistory:", err);
  });
} else {
  console.error("User ID not found.");
}
