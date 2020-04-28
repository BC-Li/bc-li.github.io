const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
      {
        name: "Lonely Together",
        artist: 'Avicii feat. Rita Ora',
        url: 'https://bc-li.github.io/songs/Lonely_Together.mp3',
        cover: 'http://img3.kuwo.cn/star/albumcover/300/74/8/226733318.jpg',
      }
    ]
});