all: $(subst xpm,png,$(wildcard xpm/*.xpm))

png/%.png: xpm/%.xpm
	convert $< $@
