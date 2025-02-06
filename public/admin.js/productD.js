$('#slider').owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    dots: true,
  });
  $('#thumb').owlCarousel({
    items: 4,
    margin: 10,
    dots: true,
    autoplay: true,
    
  });

  
document.addEventListener("DOMContentLoaded", function () {

  const images = document.querySelectorAll("#slider .item img");

  
  images.forEach((image) => {
    const panzoomInstance = Panzoom(image, {
      maxScale: 3, 
      contain: "outside", 
    });

    
    image.parentElement.addEventListener("wheel", panzoomInstance.zoomWithWheel);
  });
});



