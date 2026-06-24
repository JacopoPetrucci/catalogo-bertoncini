module CatalogoBertoncini
  # Per ogni opera, legge assets/opere/<slug>/materiali/ e popola
  # page.materiali con un bottone per ogni file (o gruppo di file)
  # trovato. L'etichetta del bottone deriva dal nome del file (es.
  # note_di_esecuzione.pdf -> "NOTE DI ESECUZIONE"). I file con lo
  # stesso nome seguito da un suffisso numerico (es. "note_01.jpg",
  # "note_02.jpg") vengono raggruppati sotto un unico bottone, e
  # mostrati insieme in ordine quando il bottone viene aperto.
  class MaterialiGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      opere = site.collections["opere"]
      return unless opere

      opere.docs.each do |doc|
        slug = File.basename(doc.relative_path, ".*")
        dir = File.join(site.source, "assets", "opere", slug, "materiali")
        next unless Dir.exist?(dir)

        files = Dir.children(dir).reject { |f| f.start_with?(".") }.sort

        groups = {}
        groups_order = []

        files.each do |file|
          name = File.basename(file, ".*")
          ext = File.extname(file).delete(".").downcase

          if name =~ /\A(.+)_(\d+)\z/
            key = $1
            num = $2.to_i
          else
            key = name
            num = 0
          end

          unless groups.key?(key)
            groups[key] = []
            groups_order << key
          end

          groups[key] << { "file" => file, "num" => num, "ext" => ext }
        end

        baseurl = site.config["baseurl"].to_s

        doc.data["materiali"] = groups_order.map do |key|
          items = groups[key].sort_by { |i| i["num"] }
          label = key.tr("_-", "  ").split(" ").reject(&:empty?).join(" ").upcase
          {
            "label" => label,
            "items" => items.map do |i|
              { "path" => "#{baseurl}/assets/opere/#{slug}/materiali/#{i['file']}", "type" => i["ext"] }
            end
          }
        end
      end
    end
  end
end
