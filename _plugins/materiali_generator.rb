module CatalogoBertoncini
  # Per ogni opera, legge assets/opere/<slug>/materiali/ e popola
  # page.materiali con un bottone per ogni file trovato. L'etichetta
  # del bottone deriva dal nome del file (es. note_di_esecuzione.pdf
  # -> "NOTE DI ESECUZIONE").
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

        doc.data["materiali"] = files.map do |file|
          name = File.basename(file, ".*")
          label = name.tr("_-", "  ").split(" ").reject(&:empty?).join(" ").upcase
          {
            "label" => label,
            "path" => "assets/opere/#{slug}/materiali/#{file}",
            "type" => File.extname(file).delete(".").downcase
          }
        end
      end
    end
  end
end
