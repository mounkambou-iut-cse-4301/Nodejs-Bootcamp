app.get('/cousins/:word', async (req, res) => {
    let word = req.params.word;
    let wordCousins = [];
    let wordfolder = folderName + 'words/';
    let previousLetters = '';
    word.split('').forEach((eachLetter) => {
      previousLetters += eachLetter;
      wordfolder += previousLetters + '/';
    });
    console.log('Requesting ' + wordfolder + word.toLowerCase() + '.json');
    if (fs.existsSync(wordfolder + word.toLowerCase() + '.json')) {
      fs.readFile(
        wordfolder + word.toLowerCase() + '.json',
        function (err, data) {
          if (err) {
            return res.json({
              message: 'Something went wrong. Please try again',
              code: 400,
            });
          }
          let wordData = JSON.parse(data);
          if (wordData.roots !== undefined && wordData.roots.length > 0) {
            // Add code to return his cousins
            const baseRoot = wordData.roots.filter(
              (root) => root.root_type.toLowerCase() === 'r'
            );
            if (baseRoot !== undefined && baseRoot.length > 0) {
              for (let i = 0; i < baseRoot.length; i++) {
                let dir = folderName + 'roots/' + baseRoot[i].meaning + '.json';
                if (fs.existsSync(dir)) {
                  const rootMeaning1 = fs.readFileSync(dir, {
                    encoding: 'utf8',
                    flag: 'r',
                  });
                  let rootMeaning = JSON.parse(rootMeaning1);
                  if (rootMeaning.words !== undefined) {
                    for (let j = 0; j < rootMeaning.words.length; j++) {
                      //add criteria to choose cousins
                      let wordfolder = folderName + 'words/';
                      let previousLetters = '';
                      rootMeaning.words[j].split('').forEach((eachLetter) => {
                        previousLetters += eachLetter;
                        wordfolder += previousLetters + '/';
                      });
                      let wordDir =
                        wordfolder + rootMeaning.words[j].toLowerCase() + '.json';
                      if (fs.existsSync(wordDir)) {
                        const word1 = fs.readFileSync(wordDir, {
                          encoding: 'utf8',
                          flag: 'r',
                        });
                        let word2 = JSON.parse(word1);
                        if (word2 !== undefined) {
                          if (
                            word2.otherForms !== undefined &&
                            word2.etym_meaning !== undefined &&
                            word2.legacy_word_id &&
                            rootMeaning.words[j].toLowerCase() !==
                              word.toLowerCase() &&
                            !wordCousins.includes(
                              rootMeaning.words[j].toLowerCase()
                            )
                          ) {
                            let audio =
                              REACT_APP_PATH +
                              'mp3/' +
                              rootMeaning.words[j][0] +
                              '/' +
                              rootMeaning.words[j] +
                              '_' +
                              word2.legacy_word_id +
                              '.mp3';
                            let audioSentence =
                              REACT_APP_PATH +
                              'mp3/' +
                              rootMeaning.words[j][0] +
                              '/' +
                              rootMeaning.words[j] +
                              '_' +
                              's' +
                              '_' +
                              word2.legacy_word_id +
                              '.mp3';
                            const myData = {
                              wordId: word2.legacy_word_id,
                              cousins: rootMeaning.words[j],
                              audio,
                              audioSentence,
                            };
                            wordCousins.push(myData);
                            // let durationSentence=0;
                            // let durationWord=0
                            //  getAudioDurationInSeconds(audio).then((duration) => {
                            //   durationWord=duration
                            //   getAudioDurationInSeconds(audioSentence).then((duration) => {
                            //     durationSentence=duration;
                            //     if(durationSentence>0 && durationWord>0){
                            //       wordCousins.push(rootMeaning.words[j]);
                            //     }
  
                            //   }).catch((e)=>{
                            //   })
                            // }).catch((e)=>{
                            // })
                          }
                        }
                      }
                    }
                  }
                }
              }
              // function returnFunction() {
              return res.status(200).json({
                message: 'Success',
                code: 200,
                data: wordCousins,
              });
              // }
              // setTimeout(returnFunction, 20000);
            } else {
              return res.json({
                message: "This word doesn't have cousins",
                code: 404,
              });
            }
          } else {
            return res.json({
              message: "This word doesn't have cousins",
              code: 404,
            });
          }
        }
      );
    } else {
      return res.json({
        message: "This word doesn't exist",
        code: 404,
      });
    }
  });